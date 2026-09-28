import { useEffect } from "react";
import { useCollection } from "../contexts/CollectionContext";
import { StatutBadge } from "../components/StatutBadge";
import { ChargementState, ErreurState, VideState } from "../components/EcranStates";
import type { Statut } from "../types/api";

const STATUTS: Statut[] = ["a_decouvrir", "en_cours", "termine"];

export function StatsPage() {
  const { stats, isLoading, error, fetchStats } = useCollection();

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container">
      <h1 className="page-title">Statistiques</h1>

      {isLoading && <ChargementState message="Calcul des statistiques…" />}
      {!isLoading && error !== null && <ErreurState message={error} />}
      {!isLoading && error === null && stats !== null && stats.total === 0 && (
        <VideState message="Ajoutez des bières à votre collection pour voir vos statistiques." />
      )}
      {!isLoading && error === null && stats !== null && stats.total > 0 && (
        <div className="card" style={{ marginTop: "1.25rem", maxWidth: 420 }}>
          <p style={{ fontSize: "1.2rem", margin: "0 0 1rem" }}>
            <strong>{stats.total}</strong> bière{stats.total > 1 ? "s" : ""} dans la collection
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {STATUTS.map((s) => (
              <div key={s} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <StatutBadge statut={s} />
                <span>{stats.par_statut[s] ?? 0}</span>
              </div>
            ))}
          </div>
          <p style={{ marginTop: "1rem" }}>
            Note moyenne :{" "}
            <strong>{stats.note_moyenne !== null ? `${stats.note_moyenne.toFixed(2)} / 5` : "—"}</strong>
          </p>
        </div>
      )}
    </div>
  );
}
