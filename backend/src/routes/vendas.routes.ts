import { Router } from "express";

import {
  consultarVendas
} from "../controllers/vendas.controller";

import {
  autenticarToken
} from "../middlewares/auth.middleware";

const vendasRouter = Router();

vendasRouter.get(
  "/",
  autenticarToken,
  consultarVendas
);

export default vendasRouter;