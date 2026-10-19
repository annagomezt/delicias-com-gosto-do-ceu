import bcrypt from "bcryptjs";
import dotenv from "dotenv";

import { db } from "../config/database";

dotenv.config();

async function criarAdmin() {
  try {
    const nome = process.env.ADMIN_NAME;
    const email = process.env.ADMIN_EMAIL;
    const senha = process.env.ADMIN_PASSWORD;

    if (!nome || !email || !senha) {
      throw new Error(
        "ADMIN_NAME, ADMIN_EMAIL e ADMIN_PASSWORD precisam estar definidos no .env."
      );
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    await db.query(
      `
        INSERT INTO usuario_admin (
          nome,
          email,
          senha_hash
        )
        VALUES ($1, $2, $3)

        ON CONFLICT (email)
        DO UPDATE SET
          nome = EXCLUDED.nome,
          senha_hash = EXCLUDED.senha_hash
      `,
      [
        nome,
        email.toLowerCase(),
        senhaHash
      ]
    );

    console.log("Administradora criada/atualizada com sucesso.");
  } catch (error) {
    console.error(
      "Erro ao criar administradora:",
      error
    );
  } finally {
    await db.end();
  }
}

criarAdmin();