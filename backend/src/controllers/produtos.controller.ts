import { Request, Response } from "express";
import { db } from "../config/database";

export async function listarProdutos(req: Request, res: Response) {
  try {
    const result = await db.query(`
      SELECT
        p.id,
        p.nome,
        p.descricao,
        p.preco,
        p.disponivel,
        p.sabor_id,
        s.nome AS sabor
      FROM produto p
      INNER JOIN sabor s ON s.id = p.sabor_id
      ORDER BY p.nome
    `);

    return res.json(result.rows);
  } catch (error) {
    console.error("Erro ao listar produtos:", error);

    return res.status(500).json({
      message: "Erro ao listar produtos."
    });
  }
}

export async function buscarProdutoPorId(
  req: Request,
  res: Response
) {
  try {
    const { id } = req.params;

    const result = await db.query(
      `
        SELECT
          p.id,
          p.nome,
          p.descricao,
          p.preco,
          p.disponivel,
          p.sabor_id,
          s.nome AS sabor
        FROM produto p
        INNER JOIN sabor s ON s.id = p.sabor_id
        WHERE p.id = $1
      `,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Produto não encontrado."
      });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao buscar produto:", error);

    return res.status(500).json({
      message: "Erro ao buscar produto."
    });
  }
}

export async function criarProduto(req: Request, res: Response) {
  try {
    const {
      nome,
      descricao,
      preco,
      saborId,
      disponivel = true
    } = req.body;

    if (!nome || nome.trim() === "") {
      return res.status(400).json({
        message: "O nome do produto é obrigatório."
      });
    }

    if (
      preco === undefined ||
      preco === null ||
      Number(preco) < 0
    ) {
      return res.status(400).json({
        message: "Informe um preço válido."
      });
    }

    if (!saborId) {
      return res.status(400).json({
        message: "O sabor é obrigatório."
      });
    }

    const sabor = await db.query(
      `
        SELECT id, ativo
        FROM sabor
        WHERE id = $1
      `,
      [saborId]
    );

    if (sabor.rowCount === 0) {
      return res.status(400).json({
        message: "O sabor informado não existe."
      });
    }

    if (!sabor.rows[0].ativo) {
      return res.status(400).json({
        message: "O sabor informado está inativo."
      });
    }

    const result = await db.query(
      `
        INSERT INTO produto (
          nome,
          descricao,
          preco,
          disponivel,
          sabor_id
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `,
      [
        nome.trim(),
        descricao?.trim() || null,
        Number(preco),
        Boolean(disponivel),
        saborId
      ]
    );

    return res.status(201).json({
      message: "Produto cadastrado com sucesso.",
      produto: result.rows[0]
    });
  } catch (error) {
    console.error("Erro ao cadastrar produto:", error);

    return res.status(500).json({
      message: "Erro ao cadastrar produto."
    });
  }
}

export async function atualizarProduto(
  req: Request,
  res: Response
) {
  try {
    const { id } = req.params;

    const {
      nome,
      descricao,
      preco,
      saborId,
      disponivel
    } = req.body;

    if (!nome || nome.trim() === "") {
      return res.status(400).json({
        message: "O nome do produto é obrigatório."
      });
    }

    if (
      preco === undefined ||
      preco === null ||
      Number(preco) < 0
    ) {
      return res.status(400).json({
        message: "Informe um preço válido."
      });
    }

    if (!saborId) {
      return res.status(400).json({
        message: "O sabor é obrigatório."
      });
    }

    const sabor = await db.query(
      `
        SELECT id
        FROM sabor
        WHERE id = $1 AND ativo = TRUE
      `,
      [saborId]
    );

    if (sabor.rowCount === 0) {
      return res.status(400).json({
        message: "O sabor informado não existe ou está inativo."
      });
    }

    const result = await db.query(
      `
        UPDATE produto
        SET
          nome = $1,
          descricao = $2,
          preco = $3,
          sabor_id = $4,
          disponivel = $5
        WHERE id = $6
        RETURNING *
      `,
      [
        nome.trim(),
        descricao?.trim() || null,
        Number(preco),
        saborId,
        Boolean(disponivel),
        id
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Produto não encontrado."
      });
    }

    return res.json({
      message: "Produto atualizado com sucesso.",
      produto: result.rows[0]
    });
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);

    return res.status(500).json({
      message: "Erro ao atualizar produto."
    });
  }
}

export async function alterarDisponibilidade(
  req: Request,
  res: Response
) {
  try {
    const { id } = req.params;
    const { disponivel } = req.body;

    if (typeof disponivel !== "boolean") {
      return res.status(400).json({
        message: "O campo disponível deve ser verdadeiro ou falso."
      });
    }

    const result = await db.query(
      `
        UPDATE produto
        SET disponivel = $1
        WHERE id = $2
        RETURNING *
      `,
      [disponivel, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Produto não encontrado."
      });
    }

    return res.json({
      message: disponivel
        ? "Produto disponibilizado com sucesso."
        : "Produto marcado como indisponível.",
      produto: result.rows[0]
    });
  } catch (error) {
    console.error("Erro ao alterar disponibilidade:", error);

    return res.status(500).json({
      message: "Erro ao alterar disponibilidade."
    });
  }
}