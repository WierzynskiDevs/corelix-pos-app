// Store compartilhado para produtos (pedidos consomem estoque)
let produtos = [
  {
    id: "1",
    nome: "Arroz 5kg",
    descricao: "Arroz tipo 1",
    valor: 25.9,
    fornecedorId: "1",
    barCode: "1234567890123",
    valorCompra: 18.0,
    desconto: 10,
    quantidadeEstoque: 120,
    quantidadePedidos: 0,
  },
  {
    id: "2",
    nome: "Feijão 1kg",
    descricao: "Feijão carioca",
    valor: 8.5,
    fornecedorId: "1",
    barCode: "4567890123456",
    valorCompra: 5.2,
    desconto: 0,
    quantidadeEstoque: 45,
    quantidadePedidos: 5,
  },
  {
    id: "3",
    nome: "Refrigerante 2L",
    descricao: "Refrigerante cola",
    valor: 9.99,
    fornecedorId: "2",
    barCode: "7890123456789",
    valorCompra: 4.5,
    desconto: 15,
    quantidadeEstoque: 30,
    quantidadePedidos: 0,
  },
];

function getProdutos() {
  return produtos;
}

function setProdutos(p) {
  produtos = p;
}

function atualizarEstoquePedidos(produtoId, quantidade) {
  const idx = produtos.findIndex((p) => p.id === produtoId);
  if (idx === -1) return;
  const qtd = Number(quantidade) || 0;
  produtos[idx].quantidadeEstoque = Math.max(0, produtos[idx].quantidadeEstoque - qtd);
  produtos[idx].quantidadePedidos = (produtos[idx].quantidadePedidos || 0) + qtd;
}

module.exports = { getProdutos, setProdutos, atualizarEstoquePedidos };
