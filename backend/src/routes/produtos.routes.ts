import { Router } from "express";

import {
  alterarDisponibilidade,
  atualizarProduto,
  buscarProdutoPorId,
  criarProduto,
  listarProdutos
} from "../controllers/produtos.controller";

import {
  autenticarToken
} from "../middlewares/auth.middleware";

const produtosRouter = Router();

produtosRouter.get("/", listarProdutos);

produtosRouter.get("/:id", buscarProdutoPorId);

produtosRouter.post("/", criarProduto);

produtosRouter.put("/:id", atualizarProduto);

produtosRouter.patch(
  "/:id/disponibilidade",
  alterarDisponibilidade
);

export default produtosRouter;

produtosRouter.get(
  "/",
  listarProdutos
);

produtosRouter.get(
  "/:id",
  buscarProdutoPorId
);

produtosRouter.post(
  "/",
  autenticarToken,
  criarProduto
);

produtosRouter.put(
  "/:id",
  autenticarToken,
  atualizarProduto
);

produtosRouter.patch(
  "/:id/disponibilidade",
  autenticarToken,
  alterarDisponibilidade
);