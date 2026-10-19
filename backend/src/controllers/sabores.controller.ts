import { Request, Response } from "express";
import { db } from "../config/database";

export async function listarSabores(req: Request, res: Response) {
  try {
    const result = await db.query(`
      SELECT id, nome, descricao, ativo
      FROM sabor
      ORDER BY nome
    `);

    return res.json(result.rows);
  } catch (error) {
    console.error("Erro ao listar sabores:", error);

    return res.status(500).json({
      message: "Erro ao listar sabores."
    });
  }
}

export async function criarSabor(req: Request, res: Response) {
  try {
    const { nome, descricao } = req.body;

    if (!nome || nome.trim() === "") {
      return res.status(400).json({
        message: "O nome do sabor é obrigatório."
      });
    }

    const saborExistente = await db.query(
      `
        SELECT id
        FROM sabor
        WHERE LOWER(nome) = LOWER($1)
      `,
      [nome.trim()]
    );

    if (saborExistente.rowCount && saborExistente.rowCount > 0) {
      return res.status(409).json({
        message: "Já existe um sabor com esse nome."
      });
    }

    const result = await db.query(
      `
        INSERT INTO sabor (nome, descricao)
        VALUES ($1, $2)
        RETURNING id, nome, descricao, ativo
      `,
      [
        nome.trim(),
        descricao?.trim() || null
      ]
    );

    return res.status(201).json({
      message: "Sabor cadastrado com sucesso.",
      sabor: result.rows[0]
    });
  } catch (error) {
    console.error("Erro ao cadastrar sabor:", error);

    return res.status(500).json({
      message: "Erro ao cadastrar sabor."
    });
  }
}