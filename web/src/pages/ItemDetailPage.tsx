import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { itemsService } from "../services/itemsService";
import { ApiError } from "../services/apiClient";
import { useAuth } from "../contexts/AuthContext";
import { AddToCollectionForm } from "../components/AddToCollectionForm";
import { ChargementState, ErreurState } from "../components/EcranStates";
import type { Item } from "../types/api";

export function ItemDetailPage() {
  const { itemId } = useParams<{ itemId: string }>();
  const idNumerique = Number(itemId);

  const [item, setItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (Number.isNaN(idNumerique)) {
      setError("Identifiant d'item invalide.");
      setIsLoading(false);
      return;
    }

    itemsService
      .getById(idNumerique)
      .then(setItem)
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : "Item introuvable.");
      })
      .finally(() => setIsLoading(false));
  }, [idNumerique]);

  if (isLoading) {
    return (
      <div className="container">
        <ChargementState message="Chargement de la fiche…" />
      </div>
    );
  }

  if (error !== null || item === null) {
    return (
      <div className="container">
        <ErreurState message={error ?? "Item introuvable."} />
        <Link to="/">← Retour au catalogue</Link>
      </div>
    );
  }

  return (
    <div className="container">
      <Link to="/" style={{ fontSize: "0.9rem" }}>
        ← Retour au catalogue
      </Link>
      <div className="card" style={{ marginTop: "1rem", display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
        <img
          src={item.image_url}
          alt={item.titre}
          style={{ width: 220, height: 220, objectFit: "cover", borderRadius: 8 }}
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        <div style={{ flex: "1 1 260px" }}>
          <h1>{item.titre}</h1>
          <p style={{ color: "var(--color-ink-muted)" }}>
            {item.brasserie} · {item.annee} · {item.categorie} · {item.degre_alcool.toFixed(1)}°
          </p>
          <p>{item.description}</p>
        </div>
      </div>

      {isAuthenticated ? (
        <AddToCollectionForm itemId={item.id} />
      ) : (
        <p style={{ marginTop: "1.25rem" }}>
          <Link to="/login">Connectez-vous</Link> pour ajouter cette bière à votre collection.
        </p>
      )}
    </div>
  );
}