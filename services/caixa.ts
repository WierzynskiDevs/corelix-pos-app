import { API_BASE_URL } from "@/constants/api";

export type StatusCaixa = "aberto" | "pendente_conferencia" | "com_diferenca" | "fechado";

export interface FechamentoCaixa {
  id: string;
  dataAbertura: string;
  dataFechamento: string | null;
  valorInicial: number;
  valorEsperado: number | null;
  valorConferido: number | null;
  diferenca?: number;
  justificativa: string | null;
  status: StatusCaixa;
  observacao: string | null;
}

export interface FechamentoCaixaInput {
  dataAbertura?: string;
  dataFechamento?: string | null;
  valorInicial?: number;
  valorEsperado?: number | null;
  valorConferido?: number | null;
  justificativa?: string | null;
  status?: StatusCaixa;
  observacao?: string | null;
}

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Erro ${res.status}`);
  return data as T;
}

export const caixaApi = {
  listar: () => request<FechamentoCaixa[]>("/api/caixa"),
  buscar: (id: string) => request<FechamentoCaixa>(`/api/caixa/${id}`),
  criar: (body: FechamentoCaixaInput) =>
    request<FechamentoCaixa>("/api/caixa", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  atualizar: (id: string, body: FechamentoCaixaInput) =>
    request<FechamentoCaixa>(`/api/caixa/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  excluir: (id: string) =>
    request<void>(`/api/caixa/${id}`, { method: "DELETE" }),
};
