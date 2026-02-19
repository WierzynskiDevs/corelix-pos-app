import { request } from "./api";

export type FormaPagamento = "PIX" | "Credito" | "Debito" | "VR" | "VA";

export interface ItemPedido {
  produtoId: string;
  nome: string;
  valor: number;
  valorFinal: number;
  quantidade: number;
  valorTotalItem: number;
}

export interface Pedido {
  id: string;
  codigo: string;
  valorTotal: number;
  valorComDesconto: number;
  formaPagamento: FormaPagamento;
  itens: ItemPedido[];
  createdAt: string;
}

export interface CriarPedidoInput {
  itens: { produtoId: string; quantidade: number }[];
  formaPagamento: FormaPagamento;
}

export const pedidosApi = {
  listar: () => request<Pedido[]>("/api/pedidos"),
  buscar: (id: string) => request<Pedido>(`/api/pedidos/${id}`),
  criar: (body: CriarPedidoInput) =>
    request<Pedido>("/api/pedidos", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};
