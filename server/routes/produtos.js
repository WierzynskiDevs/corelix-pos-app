const express = require("express");
const router = express.Router();
const { getProdutos, setProdutos } = require("../store");

function valorFinal(valor, desconto) {
  const pct = Number(desconto) || 0;
  return Math.round(valor * (1 - pct / 100) * 100) / 100;
}

function gerarId() {
  return String(Date.now());
}

router.get("/", (_, res) => {
  const produtos = getProdutos();
  const comValorFinal = produtos.map((p) => ({
    ...p,
    valorFinal: valorFinal(p.valor, p.desconto),
  }));
  res.json(comValorFinal);
});

router.get("/:id", (req, res) => {
  const produtos = getProdutos();
  const item = produtos.find((p) => p.id === req.params.id);
  if (!item) return res.status(404).json({ error: "Produto não encontrado" });
  res.json({ ...item, valorFinal: valorFinal(item.valor, item.desconto) });
});

router.post("/", (req, res) => {
  const produtos = getProdutos();
  const body = req.body;
  const valorCompra = body.valorCompra != null ? Number(body.valorCompra) : 0;
  const novo = {
    id: body.id || gerarId(),
    nome: body.nome || "",
    descricao: body.descricao || "",
    valor: Number(body.valor) || 0,
    fornecedorId: body.fornecedorId || null,
    barCode: body.barCode || "",
    valorCompra,
    desconto: Number(body.desconto) || 0,
    quantidadeEstoque: Number(body.quantidadeEstoque) || 0,
    quantidadePedidos: 0,
  };
  let qtdPedidos = Math.min(Number(body.quantidadePedidos) || 0, novo.quantidadeEstoque);
  novo.quantidadePedidos = qtdPedidos;
  produtos.push(novo);
  setProdutos(produtos);
  res.status(201).json({ ...novo, valorFinal: valorFinal(novo.valor, novo.desconto) });
});

router.put("/:id", (req, res) => {
  const produtos = getProdutos();
  const idx = produtos.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Produto não encontrado" });
  const atual = produtos[idx];
  const body = req.body;
  const quantidadeEstoque = body.quantidadeEstoque !== undefined ? Number(body.quantidadeEstoque) : atual.quantidadeEstoque;
  let quantidadePedidos = body.quantidadePedidos !== undefined ? Number(body.quantidadePedidos) : atual.quantidadePedidos;
  if (quantidadePedidos > quantidadeEstoque) quantidadePedidos = quantidadeEstoque;
  const atualizado = {
    ...atual,
    nome: body.nome !== undefined ? body.nome : atual.nome,
    descricao: body.descricao !== undefined ? body.descricao : atual.descricao,
    valor: body.valor !== undefined ? Number(body.valor) : atual.valor,
    fornecedorId: body.fornecedorId !== undefined ? body.fornecedorId : atual.fornecedorId,
    barCode: body.barCode !== undefined ? body.barCode : atual.barCode,
    desconto: body.desconto !== undefined ? Number(body.desconto) : atual.desconto,
    quantidadeEstoque,
    quantidadePedidos,
  };
  produtos[idx] = atualizado;
  setProdutos(produtos);
  res.json({ ...atualizado, valorFinal: valorFinal(atualizado.valor, atualizado.desconto) });
});

router.delete("/:id", (req, res) => {
  const produtos = getProdutos();
  const idx = produtos.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Produto não encontrado" });
  produtos.splice(idx, 1);
  setProdutos(produtos);
  res.status(204).send();
});

module.exports = router;
