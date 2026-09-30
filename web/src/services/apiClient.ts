import type { ApiErrorBody } from "../types/api";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  readonly code: number;

  constructor(code: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  if (typeof value !== "object" || value === null || !("erreur" in value)) {
    return false;
  }
  const erreur = (value as { erreur: unknown }).erreur;
  return (
    typeof erreur === "object" &&
    erreur !== null &&
    "code" in erreur &&
    "message" in erreur
  );
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string | null;
  searchParams?: Record<string, string | number | undefined>;
}

function buildUrl(path: string, searchParams?: RequestOptions["searchParams"]): string {
  const url = new URL(BASE_URL + path);
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, token, searchParams } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path, searchParams), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    // Erreur réseau (serveur injoignable, CORS, etc.)
    throw new ApiError(0, "Impossible de joindre le serveur. Vérifiez votre connexion.");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    if (isApiErrorBody(payload)) {
      throw new ApiError(payload.erreur.code, payload.erreur.message);
    }
    throw new ApiError(response.status, "Une erreur inattendue est survenue.");
  }

  return payload as T;
}

export const apiClient = {
  get: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "GET" }),

  post: <T>(path: string, body: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "POST", body }),

  patch: <T>(path: string, body: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "PATCH", body }),

  delete: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "DELETE" }),
};