import { Request, Response } from "express";
import { db } from "../config/database";

export async function consultarProducaoPorSabor(
  req: Request,
  res: Response
) {
  try {
    const data = req.query.data
      ? String(req.query.data)
      : "";

    if (!data) {
      return res.status(400).json({
        message:
          "Informe a data da produção."
      });
    }

    const dataValida =
      /^\d{4}-\d{2}-\d{2}$/.test(data);

    if (!dataValida) {
      return res.status(400).json({
        message:
          "Informe uma data válida no formato AAAA-MM-DD."
      });
    }

    const result = await db.query(
      `
        SELECT
          s.id AS sabor_id,
          s.nome AS sabor,

          SUM(ip.quantidade)::INTEGER
            AS quantidade

        FROM pedido p

        INNER JOIN item_pedido ip
          ON ip.pedido_id = p.id

        INNER JOIN produto pr
          ON pr.id = ip.produto_id

        INNER JOIN sabor s
          ON s.id = pr.sabor_id

        WHERE
          p.data_encomenda = $1::date
          AND p.status <> 'CANCELADO'

        GROUP BY
          s.id,
          s.nome

        ORDER BY
          s.nome
      `,
      [data]
    );

    const totalGeral = result.rows.reduce(
      (total, item) =>
        total + Number(item.quantidade),
      0
    );

    return res.json({
      data,
      totalGeral,
      sabores: result.rows
    });
  } catch (error) {
    console.error(
      "Erro ao consultar produção:",
      error
    );

    return res.status(500).json({
      message:
        "Erro ao consultar a produção."
    });
  }
}