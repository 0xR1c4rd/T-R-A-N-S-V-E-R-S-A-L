import { apiClient } from "./apiClient";
import type { LoginIn, RegisterIn, TokenOut, UserOut } from "../types/api";

export const authService = {
  register: (data: RegisterIn) => apiClient.post<UserOut>("/auth/register", data),

  login: (data: LoginIn) => apiClient.post<TokenOut>("/auth/login", data),

  me: (token: string) => apiClient.get<UserOut>("/auth/me", { token }),
};