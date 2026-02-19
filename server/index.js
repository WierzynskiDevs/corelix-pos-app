const express = require("express");
const cors = require("cors");
const caixaRoutes = require("./routes/caixa");
const fornecedoresRoutes = require("./routes/fornecedores");
const produtosRoutes = require("./routes/produtos");
const pedidosRoutes = require("./routes/pedidos");
const authRoutes = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/api/caixa", caixaRoutes);
app.use("/api/fornecedores", fornecedoresRoutes);
app.use("/api/produtos", produtosRoutes);
app.use("/api/pedidos", pedidosRoutes);
app.use("/api/auth", authRoutes);

app.get("/api/health", (_, res) => {
  res.json({ ok: true, message: "Corelix POS API" });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
