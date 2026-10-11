import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, apiClient, setUnauthorizedHandler } from "./apiClient";

function reponse(status: number, corps?: unknown): Response {
  return new Response(corps === undefined ? null : JSON.stringify(corps), { status });
}

describe("apiClient", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
    setUnauthorizedHandler(null);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renvoie le JSON d'une réponse réussie", async () => {
    fetchMock.mockResolvedValue(reponse(200, { total: 40 }));
    const data = await apiClient.get<{ total: number }>("/items");
    expect(data.total).toBe(40);
  });

  it("ajoute l'en-tête Authorization quand un token est fourni", async () => {
    fetchMock.mockResolvedValue(reponse(200, []));
    await apiClient.get("/me/collection", { token: "abc123" });

    const init = fetchMock.mock.calls[0]?.[1];
    expect(init?.headers).toMatchObject({ Authorization: "Bearer abc123" });
  });

  it("n'ajoute pas d'en-tête Authorization sans token", async () => {
    fetchMock.mockResolvedValue(reponse(200, []));
    await apiClient.get("/items");

    const init = fetchMock.mock.calls[0]?.[1];
    expect(init?.headers).not.toHaveProperty("Authorization");
  });

  it("construit la query string et ignore les paramètres undefined", async () => {
    fetchMock.mockResolvedValue(reponse(200, {}));
    await apiClient.get("/items", { searchParams: { q: "chimay", categorie: undefined, page: 2 } });

    const url = String(fetchMock.mock.calls[0]?.[0]);
    expect(url).toContain("q=chimay");
    expect(url).toContain("page=2");
    expect(url).not.toContain("categorie");
  });

  it("traduit { erreur: { code, message } } en ApiError", async () => {
    fetchMock.mockResolvedValue(
      reponse(404, { erreur: { code: 404, message: "Bière introuvable" } })
    );

    const erreur = await apiClient.get("/items/999").catch((e: unknown) => e);

    expect(erreur).toBeInstanceOf(ApiError);
    expect((erreur as ApiError).code).toBe(404);
    expect((erreur as ApiError).message).toBe("Bière introuvable");
  });

  it("renvoie une ApiError générique si le corps d'erreur n'a pas le bon format", async () => {
    fetchMock.mockResolvedValue(reponse(422, { detail: [{ msg: "invalide" }] }));

    const erreur = await apiClient.get("/items").catch((e: unknown) => e);

    expect(erreur).toBeInstanceOf(ApiError);
    expect((erreur as ApiError).code).toBe(422);
  });

  it("renvoie une ApiError de code 0 quand le serveur est injoignable", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));

    const erreur = await apiClient.get("/items").catch((e: unknown) => e);

    expect(erreur).toBeInstanceOf(ApiError);
    expect((erreur as ApiError).code).toBe(0);
    expect((erreur as ApiError).message).toContain("Impossible de joindre le serveur");
  });

  it("renvoie undefined pour une réponse 204", async () => {
    fetchMock.mockResolvedValue(reponse(204));
    const data = await apiClient.delete("/me/collection/1", { token: "abc" });
    expect(data).toBeUndefined();
  });

  it("appelle le callback de déconnexion sur un 401 avec token", async () => {
    const handler = vi.fn();
    setUnauthorizedHandler(handler);
    fetchMock.mockResolvedValue(reponse(401, { erreur: { code: 401, message: "Token expiré" } }));

    await apiClient.get("/me/stats", { token: "vieux" }).catch(() => undefined);

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("n'appelle pas le callback sur un 401 sans token (mauvais mot de passe)", async () => {
    const handler = vi.fn();
    setUnauthorizedHandler(handler);
    fetchMock.mockResolvedValue(reponse(401, { erreur: { code: 401, message: "Identifiants invalides" } }));

    await apiClient.post("/auth/login", { email: "a@b.fr", password: "x" }).catch(() => undefined);

    expect(handler).not.toHaveBeenCalled();
  });
});