import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";

const mockUseAuth = vi.fn();

vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

afterEach(cleanup);

function monter() {
  return render(
    <MemoryRouter initialEntries={["/collection"]}>
      <Routes>
        <Route path="/login" element={<p>Page de connexion</p>} />
        <Route
          path="/collection"
          element={
            <ProtectedRoute>
              <p>Contenu privé</p>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  it("redirige vers /login quand l'utilisateur n'est pas authentifié", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false });
    monter();
    expect(screen.getByText("Page de connexion")).toBeTruthy();
    expect(screen.queryByText("Contenu privé")).toBeNull();
  });

  it("affiche le contenu quand l'utilisateur est authentifié", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true });
    monter();
    expect(screen.getByText("Contenu privé")).toBeTruthy();
  });
});