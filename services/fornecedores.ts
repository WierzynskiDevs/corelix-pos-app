import { request } from "./api";

export interface Fornecedor {
  id: string;
  cnpj: string;
  razaoSocial: string;
  endereco: string;
  telefone: string;
}

export interface FornecedorInput {
  cnpj?: string;
  razaoSocial?: string;
  endereco?: string;
  telefone?: string;
}

export const fornecedoresApi = {
  listar: () => request<Fornecedor[]>("/api/fornecedores"),
  buscar: (id: string) => request<Fornecedor>(`/api/fornecedores/${id}`),
  criar: (body: FornecedorInput) =>
    request<Fornecedor>("/api/fornecedores", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  atualizar: (id: string, body: FornecedorInput) =>
    request<Fornecedor>(`/api/fornecedores/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  excluir: (id: string) =>
    request<void>(`/api/fornecedores/${id}`, { method: "DELETE" }),
};
