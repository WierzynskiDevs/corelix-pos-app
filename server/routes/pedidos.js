const express = require("express");
const router = express.Router();
const { getProdutos, atualizarEstoquePedidos } = require("../store");

let pedidos = [];
let proximoCodigo = 1000;

function gerarId() {
  return String(Date.now());
}

function gerarCodigoPedido() {
  const codigo = `PED-${proximoCodigo}`;
  proximoCodigo += 1;
  return codigo;
}

router.get("/", (_, res) => res.json(pedidos));

router.get("/:id", (req, res) => {
  const item = pedidos.find((p) => p.id === req.params.id);
  if (!item) return res.status(404).json({ error: "Pedido não encontrado" });
  res.json(item);
});

router.post("/", (req, res) => {
  const body = req.body;
  const itens = body.itens || [];
  const formaPagamento = body.formaPagamento || "PIX";

  let valorTotal = 0;
  let valorComDesconto = 0;
  const itensComValores = [];
  const produtosData = getProdutos();

  for (const item of itens) {
    const prod = produtosData.find((p) => p.id === item.produtoId);
    if (!prod) return res.status(400).json({ error: `Produto ${item.produtoId} não encontrado` });
    const disponivel = prod.quantidadeEstoque - (prod.quantidadePedidos || 0);
    let qtd = Math.max(0, Number(item.quantidade) || 0);
    if (qtd > disponivel) qtd = disponivel;
    const valorUnit = prod.valor;
    const desc = prod.desconto || 0;
    const valorFinalUnit = Math.round(prod.valor * (1 - desc / 100) * 100) / 100;
    const valorBruto = valorUnit * qtd;
    const valorComDescItem = valorFinalUnit * qtd;
    valorTotal += valorBruto;
    valorComDesconto += valorComDescItem;
    itensComValores.push({
      produtoId: prod.id,
      nome: prod.nome,
      valor: valorUnit,
      valorFinal: valorFinalUnit,
      quantidade: qtd,
      valorTotalItem: valorComDescItem,
    });
  }

  const codigo = gerarCodigoPedido();
  const pedido = {
    id: gerarId(),
    codigo,
    valorTotal: Math.round(valorTotal * 100) / 100,
    valorComDesconto: Math.round(valorComDesconto * 100) / 100,
    formaPagamento,
    itens: itensComValores,
    createdAt: new Date().toISOString(),
  };
  pedidos.push(pedido);

  // Consumir estoque: diminuir quantidadeEstoque e aumentar quantidadePedidos
  for (const item of itensComValores) {
    atualizarEstoquePedidos(item.produtoId, item.quantidade);
  }

  res.status(201).json(pedido);
});

module.exports = router;
