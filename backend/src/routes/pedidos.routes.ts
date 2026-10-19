import { Router } from "express";

import {
  criarPedido,
  listarPedidos,
  atualizarStatusPedido
} from "../controllers/pedidos.controller";

import {
  autenticarToken
} from "../middlewares/auth.middleware";

const pedidosRouter = Router();

pedidosRouter.get(
  "/",
  autenticarToken,
  listarPedidos
);
pedidosRouter.post("/", criarPedido);

pedidosRouter.patch(
  "/:id/status",
  autenticarToken,
  atualizarStatusPedido
);

export default pedidosRouter;