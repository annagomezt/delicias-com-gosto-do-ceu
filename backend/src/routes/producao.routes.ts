import { Router } from "express";

import {
  consultarProducaoPorSabor
} from "../controllers/producao.controller";

import {
  autenticarToken
} from "../middlewares/auth.middleware";

const producaoRouter = Router();

producaoRouter.get(
  "/",
  autenticarToken,
  consultarProducaoPorSabor
);

export default producaoRouter;