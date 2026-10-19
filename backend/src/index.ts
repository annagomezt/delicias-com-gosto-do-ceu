import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { db } from "./config/database";
import saboresRouter from "./routes/sabores.routes";
import produtosRouter from "./routes/produtos.routes";
import pedidosRouter from "./routes/pedidos.routes";
import producaoRouter from "./routes/producao.routes";
import authRouter from "./routes/auth.routes";
import dashboardRouter from "./routes/dashboard.routes";
import vendasRouter from "./routes/vendas.routes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/sabores", saboresRouter);
app.use("/produtos", produtosRouter);
app.use("/pedidos", pedidosRouter);
app.use("/producao", producaoRouter);
app.use("/auth", authRouter);
app.use("/dashboard", dashboardRouter);
app.use("/vendas", vendasRouter);

app.get("/", (req, res) => {
  res.json({
    message: "API Delícias com Gosto do Céu funcionando."
  });
});

app.get("/database", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW()");

    res.json({
      message: "Banco de dados conectado.",
      databaseTime: result.rows[0].now
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erro ao conectar ao banco de dados."
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});