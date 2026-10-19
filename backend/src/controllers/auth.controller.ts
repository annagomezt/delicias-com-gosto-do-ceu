import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { db } from "../config/database";

export async function login(
  req: Request,
  res: Response
) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        message:
          "Informe o e-mail e a senha."
      });
    }

    const result = await db.query(
      `
        SELECT
          id,
          nome,
          email,
          senha_hash
        FROM usuario_admin
        WHERE LOWER(email) = LOWER($1)
        LIMIT 1
      `,
      [email.trim()]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({
        message:
          "E-mail ou senha inválidos."
      });
    }

    const usuario = result.rows[0];

    const senhaCorreta =
      await bcrypt.compare(
        senha,
        usuario.senha_hash
      );

    if (!senhaCorreta) {
      return res.status(401).json({
        message:
          "E-mail ou senha inválidos."
      });
    }

    const secret =
      process.env.JWT_SECRET;

    if (!secret) {
      throw new Error(
        "JWT_SECRET não configurado."
      );
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email
      },
      secret,
      {
        expiresIn: "8h"
      }
    );

    return res.json({
      message:
        "Login realizado com sucesso.",

      token,

      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email
      }
    });
  } catch (error) {
    console.error(
      "Erro no login:",
      error
    );

    return res.status(500).json({
      message:
        "Erro ao realizar login."
    });
  }
}