import { Request, Response } from "express";
import { db } from "../config/database";

export async function carregarDashboard(
  req: Request,
  res: Response
) {
  try {
    const resumoResult = await db.query(`
      SELECT
        (
          SELECT COUNT(*)::INTEGER
          FROM pedido
          WHERE status <> 'CANCELADO'
        ) AS total_pedidos,

        (
          SELECT COUNT(*)::INTEGER
          FROM produto
          WHERE disponivel = TRUE
        ) AS produtos_ativos,

        (
          SELECT COALESCE(
            SUM(total),
            0
          )::NUMERIC(10,2)
          FROM pedido
          WHERE status <> 'CANCELADO'
        ) AS faturamento_total,

        (
          SELECT COALESCE(
            SUM(ip.quantidade),
            0
          )::INTEGER
          FROM item_pedido ip
          INNER JOIN pedido p
            ON p.id = ip.pedido_id
          WHERE p.status <> 'CANCELADO'
        ) AS total_sanduiches
    `);

    const proximosPedidosResult =
      await db.query(`
        SELECT
          p.id,
          p.data_encomenda,
          p.status,
          p.total,
          c.nome AS cliente_nome,
          c.local AS cliente_local,
          COALESCE(
            SUM(ip.quantidade),
            0
          )::INTEGER AS quantidade_itens
        FROM pedido p

        INNER JOIN cliente c
          ON c.id = p.cliente_id

        LEFT JOIN item_pedido ip
          ON ip.pedido_id = p.id

        WHERE
          p.status NOT IN (
            'CANCELADO',
            'CONCLUIDO'
          )

        GROUP BY
          p.id,
          p.data_encomenda,
          p.status,
          p.total,
          c.nome,
          c.local

        ORDER BY
          p.data_encomenda ASC,
          p.id ASC

        LIMIT 5
      `);

    const resumo =
      resumoResult.rows[0];

    return res.json({
      resumo: {
        totalPedidos:
          Number(resumo.total_pedidos),

        produtosAtivos:
          Number(resumo.produtos_ativos),

        faturamentoTotal:
          Number(resumo.faturamento_total),

        totalSanduiches:
          Number(resumo.total_sanduiches)
      },

      proximosPedidos:
        proximosPedidosResult.rows
    });
  } catch (error) {
    console.error(
      "Erro ao carregar dashboard:",
      error
    );

    return res.status(500).json({
      message:
        "Erro ao carregar o dashboard."
    });
  }
}