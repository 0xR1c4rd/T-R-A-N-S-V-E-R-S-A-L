import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { StatutBadge } from "./StatutBadge";
import type { Statut } from "../types/api";

afterEach(cleanup);

describe("StatutBadge", () => {
  const cas: [Statut, string][] = [
    ["a_decouvrir", "À découvrir"],
    ["en_cours", "En cours"],
    ["termine", "Terminé"],
  ];

  it.each(cas)("affiche le libellé français de %s", (statut, libelle) => {
    render(<StatutBadge statut={statut} />);
    expect(screen.getByText(libelle)).toBeTruthy();
  });
});