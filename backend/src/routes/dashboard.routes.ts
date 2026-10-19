import { Router } from "express";

import {
  carregarDashboard
} from "../controllers/dashboard.controller";

import {
  autenticarToken
} from "../middlewares/auth.middleware";

const dashboardRouter = Router();

dashboardRouter.get(
  "/",
  autenticarToken,
  carregarDashboard
);

export default dashboardRouter;