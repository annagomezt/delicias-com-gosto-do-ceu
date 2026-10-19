import { Router } from "express";
import {
  criarSabor,
  listarSabores
} from "../controllers/sabores.controller";

import {
  autenticarToken
} from "../middlewares/auth.middleware";

const saboresRouter = Router();

saboresRouter.get("/", listarSabores);
saboresRouter.post(
  "/",
  autenticarToken,
  criarSabor
);

export default saboresRouter;