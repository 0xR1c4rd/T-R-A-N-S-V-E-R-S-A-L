import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useDebounce } from "./useDebounce";

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renvoie la valeur initiale immédiatement", () => {
    const { result } = renderHook(() => useDebounce("chimay", 400));
    expect(result.current).toBe("chimay");
  });

  it("ne met pas à jour la valeur avant 400 ms", () => {
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 400), {
      initialProps: { v: "ch" },
    });

    rerender({ v: "chi" });
    act(() => {
      vi.advanceTimersByTime(399);
    });

    expect(result.current).toBe("ch");
  });

  it("met à jour la valeur une fois 400 ms écoulées", () => {
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 400), {
      initialProps: { v: "ch" },
    });

    rerender({ v: "chi" });
    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(result.current).toBe("chi");
  });

  it("n'applique que la dernière valeur quand on tape vite", () => {
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 400), {
      initialProps: { v: "" },
    });

    for (const lettre of ["c", "ch", "chi", "chim", "chima", "chimay"]) {
      rerender({ v: lettre });
      act(() => {
        vi.advanceTimersByTime(100); // frappe rapide : moins de 400 ms entre deux lettres
      });
    }
    expect(result.current).toBe(""); // aucune requête partie pendant la frappe

    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(result.current).toBe("chimay"); // une seule mise à jour, avec le mot complet
  });
});