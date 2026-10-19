import {
  NextFunction,
  Request,
  Response
} from "express";

import jwt from "jsonwebtoken";

export function autenticarToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authorization =
    req.headers.authorization;

  if (
    !authorization ||
    !authorization.startsWith("Bearer ")
  ) {
    return res.status(401).json({
      message:
        "Acesso não autorizado."
    });
  }

  const token =
    authorization.split(" ")[1];

  const secret =
    process.env.JWT_SECRET;

  if (!secret) {
    return res.status(500).json({
      message:
        "Configuração de autenticação inválida."
    });
  }

  try {
    jwt.verify(token, secret);

    next();
  } catch {
    return res.status(401).json({
      message:
        "Sessão inválida ou expirada."
    });
  }
}