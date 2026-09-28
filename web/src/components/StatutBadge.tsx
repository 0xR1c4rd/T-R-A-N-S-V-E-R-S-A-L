import type { Statut } from "../types/api";

const LIBELLES: Record<Statut, string> = {
  a_decouvrir: "À découvrir",
  en_cours: "En cours",
  termine: "Terminé",
};

const STYLES: Record<Statut, { background: string; color: string }> = {
  a_decouvrir: { background: "var(--color-neutral-bg)", color: "var(--color-neutral)" },
  en_cours: { background: "var(--color-warning-bg)", color: "var(--color-warning)" },
  termine: { background: "var(--color-success-bg)", color: "var(--color-success)" },
};

interface StatutBadgeProps {
  statut: Statut;
}

export function StatutBadge({ statut }: StatutBadgeProps) {
  return (
    <span className="badge" style={STYLES[statut]}>
      {LIBELLES[statut]}
    </span>
  );
}
