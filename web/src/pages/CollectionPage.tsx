import { useEffect, useState } from "react";
import { useCollection } from "../contexts/CollectionContext";
import { EntryCard } from "../components/EntryCard";
import { ChargementState, ErreurState, VideState } from "../components/EcranStates";
import type { Statut, Tri } from "../types/api";

export function CollectionPage() {
  const { entries, isLoading, error, fetchEntries, updateEntry, removeEntry } = useCollection();
  const [statut, setStatut] = useState<Statut | "">("");
  const [tri, setTri] = useState<Tri | "">("date");

  useEffect(() => {
    fetchEntries({
      statut: statut === "" ? undefined : statut,
      tri: tri === "" ? undefined : tri,
    });
  }, [statut, tri]);

  return (
    <div className="container">
      <h1 className="page-title">Ma collection</h1>

      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", margin: "1.25rem 0" }}>
        <select
          className="select"
          value={statut}
          onChange={(e) => setStatut(e.target.value as Statut | "")}
          aria-label="Filtrer par statut"
        >
          <option value="">Tous les statuts</option>
          <option value="a_decouvrir">À découvrir</option>
          <option value="en_cours">En cours</option>
          <option value="termine">Terminé</option>
        </select>
        <select
          className="select"
          value={tri}
          onChange={(e) => setTri(e.target.value as Tri | "")}
          aria-label="Trier"
        >
          <option value="date">Trier par date d'ajout</option>
          <option value="note">Trier par note</option>
        </select>
      </div>

      {isLoading && <ChargementState message="Chargement de votre collection…" />}
      {!isLoading && error !== null && <ErreurState message={error} />}
      {!isLoading && error === null && entries.length === 0 && (
        <VideState message="Votre collection est vide pour l'instant. Direction le catalogue !" />
      )}
      {!isLoading && error === null && entries.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {entries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} onUpdate={updateEntry} onDelete={removeEntry} />
          ))}
        </div>
      )}
    </div>
  );
}
