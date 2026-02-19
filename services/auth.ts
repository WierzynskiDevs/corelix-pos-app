import { request } from "./api";

export type Role = "admin" | "gu";

export interface User {
  id: string;
  login: string;
  nome: string;
  role: Role;
}

export const authApi = {
  login: (login: string, senha: string) =>
    request<User>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ login, senha }),
    }),
};
