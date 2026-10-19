import { Request, Response } from "express";
import { db } from "../config/database";

interface ItemRecebido {
  produtoId: number;
  quantidade: number;
}

export async function criarPedido(req: Request, res: Response) {
  const client = await db.connect();

  try {
    const {
      nome,
      telefone,
      local,
      dataEncomenda,
      itens
    } = req.body;

    // =========================
    // VALIDAÇÕES INICIAIS
    // =========================

    if (!nome || nome.trim() === "") {
      return res.status(400).json({
        message: "O nome do cliente é obrigatório."
      });
    }

    if (!telefone || telefone.trim() === "") {
      return res.status(400).json({
        message: "O telefone do cliente é obrigatório."
      });
    }

    if (!dataEncomenda) {
      return res.status(400).json({
        message: "A data da encomenda é obrigatória."
      });
    }

    if (!Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({
        message: "O pedido deve possuir pelo menos um produto."
      });
    }

    // =========================
    // REGRA DE ANTECEDÊNCIA
    // =========================

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const dataMinima = new Date(hoje);
    dataMinima.setDate(dataMinima.getDate() + 1);

    const dataPedido = new Date(
      `${dataEncomenda}T00:00:00`
    );

    if (
      Number.isNaN(dataPedido.getTime()) ||
      dataPedido < dataMinima
    ) {
      return res.status(400).json({
        message:
          "A encomenda deve ser realizada com pelo menos um dia de antecedência."
      });
    }

    // =========================
    // VALIDAR QUANTIDADES
    // =========================

    for (const item of itens as ItemRecebido[]) {
      if (
        !item.produtoId ||
        !Number.isInteger(Number(item.quantidade)) ||
        Number(item.quantidade) <= 0
      ) {
        return res.status(400).json({
          message:
            "Todos os produtos devem possuir uma quantidade válida."
        });
      }
    }

    await client.query("BEGIN");

    // =========================
    // BUSCAR PRODUTOS NO BANCO
    // =========================

    const idsProdutos = itens.map(
      (item: ItemRecebido) => Number(item.produtoId)
    );

    const produtosResult = await client.query(
      `
        SELECT
          id,
          nome,
          preco,
          disponivel
        FROM produto
        WHERE id = ANY($1::bigint[])
      `,
      [idsProdutos]
    );

    if (produtosResult.rows.length !== idsProdutos.length) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message:
          "Um ou mais produtos informados não existem."
      });
    }

    // =========================
    // PRODUTOS INDISPONÍVEIS
    // =========================

    const produtoIndisponivel =
      produtosResult.rows.find(
        (produto) => !produto.disponivel
      );

    if (produtoIndisponivel) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message: `O produto "${produtoIndisponivel.nome}" está indisponível.`
      });
    }

    // =========================
    // CALCULAR TOTAL PELO BANCO
    // =========================

    let total = 0;

    for (const item of itens as ItemRecebido[]) {
      const produto = produtosResult.rows.find(
        (produto) =>
          Number(produto.id) === Number(item.produtoId)
      );

      if (!produto) {
        continue;
      }

      total +=
        Number(produto.preco) *
        Number(item.quantidade);
    }

    // =========================
    // IDENTIFICAR CLIENTE
    // =========================

    const clienteExistente = await client.query(
      `
        SELECT id
        FROM cliente
        WHERE telefone = $1
        ORDER BY id
        LIMIT 1
      `,
      [telefone.trim()]
    );

    let clienteId: number;

    if (clienteExistente.rowCount) {
      clienteId = clienteExistente.rows[0].id;

      await client.query(
        `
          UPDATE cliente
          SET
            nome = $1,
            local = $2
          WHERE id = $3
        `,
        [
          nome.trim(),
          local?.trim() || null,
          clienteId
        ]
      );
    } else {
      const novoCliente = await client.query(
        `
          INSERT INTO cliente (
            nome,
            telefone,
            local
          )
          VALUES ($1, $2, $3)
          RETURNING id
        `,
        [
          nome.trim(),
          telefone.trim(),
          local?.trim() || null
        ]
      );

      clienteId = novoCliente.rows[0].id;
    }

    // =========================
    // CRIAR PEDIDO
    // =========================

    const pedidoResult = await client.query(
      `
        INSERT INTO pedido (
          cliente_id,
          data_encomenda,
          status,
          total
        )
        VALUES ($1, $2, 'RECEBIDO', $3)
        RETURNING
          id,
          data_pedido,
          data_encomenda,
          status,
          total
      `,
      [
        clienteId,
        dataEncomenda,
        total.toFixed(2)
      ]
    );

    const pedido = pedidoResult.rows[0];

    // =========================
    // CRIAR ITENS
    // =========================

    for (const item of itens as ItemRecebido[]) {
      const produto = produtosResult.rows.find(
        (produto) =>
          Number(produto.id) === Number(item.produtoId)
      );

      if (!produto) {
        continue;
      }

      await client.query(
        `
          INSERT INTO item_pedido (
            pedido_id,
            produto_id,
            quantidade,
            preco_unitario
          )
          VALUES ($1, $2, $3, $4)
        `,
        [
          pedido.id,
          produto.id,
          Number(item.quantidade),
          produto.preco
        ]
      );
    }

    await client.query("COMMIT");

    return res.status(201).json({
      message: "Pedido realizado com sucesso.",
      pedido: {
        id: pedido.id,
        clienteId,
        dataPedido: pedido.data_pedido,
        dataEncomenda: pedido.data_encomenda,
        status: pedido.status,
        total: pedido.total
      }
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Erro ao realizar pedido:", error);

    return res.status(500).json({
      message: "Erro ao realizar pedido."
    });
  } finally {
    client.release();
  }
}

export async function listarPedidos(
  req: Request,
  res: Response
) {
  try {
    const data = req.query.data
      ? String(req.query.data)
      : null;

    const result = await db.query(
      `
        SELECT
          p.id,
          p.data_pedido,
          p.data_encomenda,
          p.status,
          p.total,

          c.id AS cliente_id,
          c.nome AS cliente_nome,
          c.telefone AS cliente_telefone,
          c.local AS cliente_local,

          COALESCE(
            json_agg(
              json_build_object(
                'id', ip.id,
                'produtoId', pr.id,
                'produto', pr.nome,
                'sabor', s.nome,
                'quantidade', ip.quantidade,
                'precoUnitario', ip.preco_unitario
              )
              ORDER BY ip.id
            )
            FILTER (WHERE ip.id IS NOT NULL),
            '[]'
          ) AS itens

        FROM pedido p

        INNER JOIN cliente c
          ON c.id = p.cliente_id

        LEFT JOIN item_pedido ip
          ON ip.pedido_id = p.id

        LEFT JOIN produto pr
          ON pr.id = ip.produto_id

        LEFT JOIN sabor s
          ON s.id = pr.sabor_id

        WHERE (
          $1::date IS NULL
          OR p.data_encomenda = $1::date
        )

        GROUP BY
          p.id,
          p.data_pedido,
          p.data_encomenda,
          p.status,
          p.total,
          c.id,
          c.nome,
          c.telefone,
          c.local

        ORDER BY
          p.data_encomenda DESC,
          p.id DESC
      `,
      [data]
    );

    return res.json(result.rows);
  } catch (error) {
    console.error(
      "Erro ao consultar pedidos:",
      error
    );

    return res.status(500).json({
      message: "Erro ao consultar pedidos."
    });
  }
}

export async function atualizarStatusPedido(
  req: Request,
  res: Response
) {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    const statusPermitidos = [
      "RECEBIDO",
      "EM_PREPARO",
      "PRONTO",
      "CONCLUIDO",
      "CANCELADO"
    ];

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Pedido inválido."
      });
    }

    if (
      !status ||
      !statusPermitidos.includes(status)
    ) {
      return res.status(400).json({
        message:
          "Informe um status válido."
      });
    }

    const pedidoExistente =
      await db.query(
        `
          SELECT id, status
          FROM pedido
          WHERE id = $1
        `,
        [id]
      );

    if (pedidoExistente.rowCount === 0) {
      return res.status(404).json({
        message:
          "Pedido não encontrado."
      });
    }

    const resultado =
      await db.query(
        `
          UPDATE pedido
          SET status = $1
          WHERE id = $2
          RETURNING
            id,
            status,
            data_encomenda,
            total
        `,
        [status, id]
      );

    return res.json({
      message:
        "Status atualizado com sucesso.",
      pedido: resultado.rows[0]
    });
  } catch (error) {
    console.error(
      "Erro ao atualizar status do pedido:",
      error
    );

    return res.status(500).json({
      message:
        "Erro ao atualizar o status do pedido."
    });
  }
}