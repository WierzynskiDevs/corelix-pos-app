/**
 * Rotas CRUD para Fechamento de Caixa (fluxo do diagrama: Fechamento Financeiro).
 * Fluxo: Fechamento caixa → Conferência valores → Diferença? → Ajuste/Justificativa → Confirmar → Relatório diário
 */

const express = require("express");
const router = express.Router();

// Mock em memória (persiste enquanto o servidor estiver rodando)
let fechamentos = [
  {
    id: "1",
    dataAbertura: "2026-02-19T08:00:00.000Z",
    dataFechamento: "2026-02-19T18:30:00.000Z",
    valorInicial: 200.0,
    valorEsperado: 4520.5,
    valorConferido: 4520.5,
    justificativa: null,
    status: "fechado", // 'aberto' | 'pendente_conferencia' | 'com_diferenca' | 'fechado'
    observacao: "Fechamento normal do dia.",
  },
  {
    id: "2",
    dataAbertura: "2026-02-18T08:00:00.000Z",
    dataFechamento: "2026-02-18T19:00:00.000Z",
    valorInicial: 200.0,
    valorEsperado: 3180.0,
    valorConferido: 3175.0,
    justificativa: "Troco dado a mais em uma venda (R$ 5,00) - aprovado pelo gerente.",
    status: "fechado",
    observacao: null,
  },
  {
    id: "3",
    dataAbertura: "2026-02-19T08:00:00.000Z",
    dataFechamento: null,
    valorInicial: 200.0,
    valorEsperado: null,
    valorConferido: null,
    justificativa: null,
    status: "aberto",
    observacao: null,
  },
];

function gerarId() {
  return String(Date.now());
}

// Listar todos
router.get("/", (req, res) => {
  res.json(fechamentos);
});

// Buscar por id
router.get("/:id", (req, res) => {
  const item = fechamentos.find((f) => f.id === req.params.id);
  if (!item) return res.status(404).json({ error: "Fechamento não encontrado" });
  res.json(item);
});

// Criar
router.post("/", (req, res) => {
  const body = req.body;
  const diferenca =
    body.valorConferido != null && body.valorEsperado != null
      ? (body.valorConferido - body.valorEsperado)
      : null;

  const novo = {
    id: body.id || gerarId(),
    dataAbertura: body.dataAbertura || new Date().toISOString(),
    dataFechamento: body.dataFechamento ?? null,
    valorInicial: Number(body.valorInicial) || 0,
    valorEsperado: body.valorEsperado != null ? Number(body.valorEsperado) : null,
    valorConferido: body.valorConferido != null ? Number(body.valorConferido) : null,
    justificativa: body.justificativa ?? null,
    status: body.status || "aberto",
    observacao: body.observacao ?? null,
  };
  if (novo.valorConferido != null && novo.valorEsperado != null) {
    novo.diferenca = novo.valorConferido - novo.valorEsperado;
  }
  fechamentos.push(novo);
  res.status(201).json(novo);
});

// Atualizar
router.put("/:id", (req, res) => {
  const idx = fechamentos.findIndex((f) => f.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Fechamento não encontrado" });

  const body = req.body;
  const atual = fechamentos[idx];
  const valorEsperado = body.valorEsperado !== undefined ? Number(body.valorEsperado) : atual.valorEsperado;
  const valorConferido = body.valorConferido !== undefined ? Number(body.valorConferido) : atual.valorConferido;

  const atualizado = {
    ...atual,
    dataAbertura: body.dataAbertura ?? atual.dataAbertura,
    dataFechamento: body.dataFechamento !== undefined ? body.dataFechamento : atual.dataFechamento,
    valorInicial: body.valorInicial !== undefined ? Number(body.valorInicial) : atual.valorInicial,
    valorEsperado,
    valorConferido: body.valorConferido !== undefined ? valorConferido : atual.valorConferido,
    justificativa: body.justificativa !== undefined ? body.justificativa : atual.justificativa,
    status: body.status ?? atual.status,
    observacao: body.observacao !== undefined ? body.observacao : atual.observacao,
  };
  if (atualizado.valorConferido != null && atualizado.valorEsperado != null) {
    atualizado.diferenca = atualizado.valorConferido - atualizado.valorEsperado;
  }
  fechamentos[idx] = atualizado;
  res.json(atualizado);
});

// Deletar
router.delete("/:id", (req, res) => {
  const idx = fechamentos.findIndex((f) => f.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Fechamento não encontrado" });
  fechamentos.splice(idx, 1);
  res.status(204).send();
});

module.exports = router;
