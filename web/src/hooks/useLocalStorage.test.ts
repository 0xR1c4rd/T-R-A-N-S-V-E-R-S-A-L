import { beforeEach, describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useLocalStorage } from "./useLocalStorage";

describe("useLocalStorage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renvoie la valeur initiale quand rien n'est stocké", () => {
    const { result } = renderHook(() => useLocalStorage<string>("cle", "defaut"));
    expect(result.current[0]).toBe("defaut");
  });

  it("relit la valeur déjà présente dans le localStorage", () => {
    window.localStorage.setItem("cle", JSON.stringify("memorise"));
    const { result } = renderHook(() => useLocalStorage<string>("cle", "defaut"));
    expect(result.current[0]).toBe("memorise");
  });

  it("met à jour l'état ET le localStorage", () => {
    const { result } = renderHook(() => useLocalStorage<string>("cle", "defaut"));

    act(() => {
      result.current[1]("nouvelle");
    });

    expect(result.current[0]).toBe("nouvelle");
    expect(window.localStorage.getItem("cle")).toBe(JSON.stringify("nouvelle"));
  });

  it("fonctionne avec un objet (générique)", () => {
    const { result } = renderHook(() =>
      useLocalStorage<{ n: number }>("objet", { n: 1 })
    );

    act(() => {
      result.current[1]({ n: 2 });
    });

    expect(result.current[0]).toEqual({ n: 2 });
  });

  it("retombe sur la valeur initiale si le JSON stocké est corrompu", () => {
    window.localStorage.setItem("cle", "{pas du json");
    const { result } = renderHook(() => useLocalStorage<string>("cle", "defaut"));
    expect(result.current[0]).toBe("defaut");
  });

  it("garde la même fonction setter entre deux rendus", () => {
    const { result, rerender } = renderHook(() => useLocalStorage<string>("cle", "x"));
    const premierSetter = result.current[1];
    rerender();
    expect(result.current[1]).toBe(premierSetter);
  });
});