import { Request, Response } from "express";
import { db } from "../config/database";

function dataValida(data: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    return false;
  }

  const [ano, mes, dia] =
    data.split("-").map(Number);

  const dataCriada =
    new Date(ano, mes - 1, dia);

  return (
    dataCriada.getFullYear() === ano &&
    dataCriada.getMonth() === mes - 1 &&
    dataCriada.getDate() === dia
  );
}

export async function consultarVendas(
  req: Request,
  res: Response
) {
  try {
    const dataInicial =
      req.query.dataInicial
        ? String(req.query.dataInicial)
        : null;

    const dataFinal =
      req.query.dataFinal
        ? String(req.query.dataFinal)
        : null;

    if (
      dataInicial &&
      !dataValida(dataInicial)
    ) {
      return res.status(400).json({
        message:
          "A data inicial informada é inválida."
      });
    }

    if (
      dataFinal &&
      !dataValida(dataFinal)
    ) {
      return res.status(400).json({
        message:
          "A data final informada é inválida."
      });
    }

    if (
      dataInicial &&
      dataFinal &&
      dataInicial > dataFinal
    ) {
      return res.status(400).json({
        message:
          "A data inicial não pode ser maior que a data final."
      });
    }

    const parametros = [
      dataInicial,
      dataFinal
    ];

    const resumoResult =
      await db.query(
        `
          SELECT
            COUNT(*)
              FILTER (
                WHERE p.status <> 'CANCELADO'
              )::INTEGER
              AS total_pedidos,

            COALESCE(
              SUM(p.total)
                FILTER (
                  WHERE p.status <> 'CANCELADO'
                ),
              0
            )::NUMERIC(10,2)
              AS faturamento_total,

            COALESCE(
              AVG(p.total)
                FILTER (
                  WHERE p.status <> 'CANCELADO'
                ),
              0
            )::NUMERIC(10,2)
              AS ticket_medio

          FROM pedido p

          WHERE
            (
              $1::date IS NULL
              OR p.data_pedido::date >= $1::date
            )

            AND

            (
              $2::date IS NULL
              OR p.data_pedido::date <= $2::date
            )
        `,
        parametros
      );

    const sanduichesResult =
      await db.query(
        `
          SELECT
            COALESCE(
              SUM(ip.quantidade),
              0
            )::INTEGER
              AS total_sanduiches

          FROM item_pedido ip

          INNER JOIN pedido p
            ON p.id = ip.pedido_id

          WHERE
            p.status <> 'CANCELADO'

            AND

            (
              $1::date IS NULL
              OR p.data_pedido::date >= $1::date
            )

            AND

            (
              $2::date IS NULL
              OR p.data_pedido::date <= $2::date
            )
        `,
        parametros
      );

    const saboresResult =
      await db.query(
        `
          SELECT
            s.id AS sabor_id,
            s.nome AS sabor,

            SUM(
              ip.quantidade
            )::INTEGER
              AS quantidade,

            COALESCE(
              SUM(
                ip.quantidade *
                ip.preco_unitario
              ),
              0
            )::NUMERIC(10,2)
              AS valor

          FROM item_pedido ip

          INNER JOIN pedido p
            ON p.id = ip.pedido_id

          INNER JOIN produto pr
            ON pr.id = ip.produto_id

          INNER JOIN sabor s
            ON s.id = pr.sabor_id

          WHERE
            p.status <> 'CANCELADO'

            AND

            (
              $1::date IS NULL
              OR p.data_pedido::date >= $1::date
            )

            AND

            (
              $2::date IS NULL
              OR p.data_pedido::date <= $2::date
            )

          GROUP BY
            s.id,
            s.nome

          ORDER BY
            quantidade DESC,
            s.nome
        `,
        parametros
      );

    const historicoResult =
      await db.query(
        `
          SELECT
            p.id,
            p.data_pedido,
            p.data_encomenda,
            p.status,
            p.total,

            c.nome
              AS cliente_nome,

            c.local
              AS cliente_local,

            COALESCE(
              SUM(ip.quantidade),
              0
            )::INTEGER
              AS quantidade_itens

          FROM pedido p

          INNER JOIN cliente c
            ON c.id = p.cliente_id

          LEFT JOIN item_pedido ip
            ON ip.pedido_id = p.id

          WHERE
            (
              $1::date IS NULL
              OR p.data_pedido::date >= $1::date
            )

            AND

            (
              $2::date IS NULL
              OR p.data_pedido::date <= $2::date
            )

          GROUP BY
            p.id,
            p.data_pedido,
            p.data_encomenda,
            p.status,
            p.total,
            c.nome,
            c.local

          ORDER BY
            p.data_pedido DESC,
            p.id DESC

          LIMIT 100
        `,
        parametros
      );

    const resumo =
      resumoResult.rows[0];

    return res.json({
      resumo: {
        totalPedidos:
          Number(resumo.total_pedidos),

        faturamentoTotal:
          Number(
            resumo.faturamento_total
          ),

        totalSanduiches:
          Number(
            sanduichesResult.rows[0]
              .total_sanduiches
          ),

        ticketMedio:
          Number(resumo.ticket_medio)
      },

      vendasPorSabor:
        saboresResult.rows.map(
          (item) => ({
            saborId:
              Number(item.sabor_id),

            sabor:
              item.sabor,

            quantidade:
              Number(item.quantidade),

            valor:
              Number(item.valor)
          })
        ),

      historico:
        historicoResult.rows.map(
          (pedido) => ({
            id:
              Number(pedido.id),

            dataPedido:
              pedido.data_pedido,

            dataEncomenda:
              pedido.data_encomenda,

            status:
              pedido.status,

            total:
              Number(pedido.total),

            clienteNome:
              pedido.cliente_nome,

            clienteLocal:
              pedido.cliente_local,

            quantidadeItens:
              Number(
                pedido.quantidade_itens
              )
          })
        )
    });
  } catch (error) {
    console.error(
      "Erro ao consultar vendas:",
      error
    );

    return res.status(500).json({
      message:
        "Erro ao consultar informações de vendas."
    });
  }
}