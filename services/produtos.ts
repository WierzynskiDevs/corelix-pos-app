import { request } from "./api";

export interface Produto {
  id: string;
  nome: string;
  descricao: string;
  valor: number;
  valorFinal: number;
  fornecedorId: string | null;
  barCode: string;
  valorCompra: number;
  desconto: number;
  quantidadeEstoque: number;
  quantidadePedidos: number;
}

export interface ProdutoInput {
  nome?: string;
  descricao?: string;
  valor?: number;
  fornecedorId?: string | null;
  barCode?: string;
  valorCompra?: number;
  desconto?: number;
  quantidadeEstoque?: number;
  quantidadePedidos?: number;
}

export const produtosApi = {
  listar: () => request<Produto[]>("/api/produtos"),
  buscar: (id: string) => request<Produto>(`/api/produtos/${id}`),
  criar: (body: ProdutoInput & { valorCompra: number }) =>
    request<Produto>("/api/produtos", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  atualizar: (id: string, body: Partial<ProdutoInput>) =>
    request<Produto>(`/api/produtos/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  excluir: (id: string) =>
    request<void>(`/api/produtos/${id}`, { method: "DELETE" }),
};

export function valorFinalCalc(valor: number, desconto: number): number {
  return Math.round(valor * (1 - desconto / 100) * 100) / 100;
}
