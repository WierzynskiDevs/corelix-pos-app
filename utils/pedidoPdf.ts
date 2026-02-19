import type { Pedido } from "@/services/pedidos";

export function gerarHtmlPedido(pedido: Pedido): string {
  const itensRows = pedido.itens
    .map(
      (i) =>
        `<tr><td>${i.nome}</td><td>${i.quantidade}</td><td>R$ ${i.valor.toFixed(2)}</td><td>R$ ${i.valorFinal.toFixed(2)}</td><td>R$ ${i.valorTotalItem.toFixed(2)}</td></tr>`
    )
    .join("");
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Pedido ${pedido.codigo}</title>
<style>
body { font-family: sans-serif; padding: 20px; }
h1 { font-size: 18px; }
table { width: 100%; border-collapse: collapse; margin: 16px 0; }
th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
th { background: #f5f5f5; }
.total { font-weight: bold; margin-top: 16px; }
</style>
</head>
<body>
<h1>Resumo do Pedido</h1>
<p><strong>Código:</strong> ${pedido.codigo}</p>
<p><strong>Data:</strong> ${new Date(pedido.createdAt).toLocaleString("pt-BR")}</p>
<p><strong>Forma de pagamento:</strong> ${pedido.formaPagamento}</p>
<table>
<thead><tr><th>Produto</th><th>Qtd</th><th>Valor unit.</th><th>Valor final unit.</th><th>Total</th></tr></thead>
<tbody>${itensRows}</tbody>
</table>
<p class="total">Valor total: R$ ${pedido.valorTotal.toFixed(2)}</p>
<p class="total">Valor com desconto: R$ ${pedido.valorComDesconto.toFixed(2)}</p>
<p style="margin-top:24px;font-size:12px;color:#666;">Corelix POS - Este código poderá ser usado para emissão de nota fiscal.</p>
</body>
</html>`;
}

export function imprimirPedido(pedido: Pedido) {
  const html = gerarHtmlPedido(pedido);
  if (typeof window !== "undefined" && window.open) {
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(html);
      w.document.close();
      w.focus();
      setTimeout(() => {
        w.print();
        w.close();
      }, 250);
    }
  }
}
