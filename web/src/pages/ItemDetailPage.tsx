import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { itemsService } from "../services/itemsService";
import { ApiError } from "../services/apiClient";
import { useAuth } from "../contexts/AuthContext";
import { useCollection } from "../contexts/CollectionContext";
import { ChargementState, ErreurState } from "../components/EcranStates";
import type { Item, Statut } from "../types/api";

export function ItemDetailPage() {
  const { itemId } = useParams<{ itemId: string }>();
  const idNumerique = Number(itemId);

  const [item, setItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isAuthenticated } = useAuth();
  const { addEntry } = useCollection();

  const [statut, setStatut] = useState<Statut>("a_decouvrir");
  const [note, setNote] = useState<string>("");
  const [commentaire, setCommentaire] = useState("");
  const [ajoutMessage, setAjoutMessage] = useState<string | null>(null);
  const [ajoutErreur, setAjoutErreur] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  async function handleAjouter(): Promise<void> {
    setAjoutMessage(null);
    setAjoutErreur(null);
    setIsSubmitting(true);
    try {
      await addEntry({
        item_id: idNumerique,
        statut,
        note: note === "" ? undefined : Number(note),
        commentaire: commentaire === "" ? undefined : commentaire,
      });
      setAjoutMessage("Ajouté à votre collection !");
    } catch (err) {
      setAjoutErreur(err instanceof ApiError ? err.message : "Ajout impossible.");
    } finally {
      setIsSubmitting(false);
    }
  }

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

      {isAuthenticated && (
        <div className="card" style={{ marginTop: "1.25rem", maxWidth: 420 }}>
          <h2 style={{ fontSize: "1.1rem" }}>Ajouter à ma collection</h2>
          <div className="field">
            <label htmlFor="statut">Statut</label>
            <select
              id="statut"
              className="select"
              value={statut}
              onChange={(e) => setStatut(e.target.value as Statut)}
            >
              <option value="a_decouvrir">À découvrir</option>
              <option value="en_cours">En cours</option>
              <option value="termine">Terminé</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="note">Note (1 à 5, optionnel)</label>
            <input
              id="note"
              className="input"
              type="number"
              min={1}
              max={5}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="commentaire">Commentaire (optionnel)</label>
            <textarea
              id="commentaire"
              className="textarea"
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
            />
          </div>
          {ajoutErreur !== null && <p className="error-text">{ajoutErreur}</p>}
          {ajoutMessage !== null && <p style={{ color: "var(--color-success)" }}>{ajoutMessage}</p>}
          <button type="button" className="btn btn-primary" disabled={isSubmitting} onClick={handleAjouter}>
            {isSubmitting ? "Ajout…" : "Ajouter"}
          </button>
        </div>
      )}
      {!isAuthenticated && (
        <p style={{ marginTop: "1.25rem" }}>
          <Link to="/login">Connectez-vous</Link> pour ajouter cette bière à votre collection.
        </p>
      )}
    </div>
  );
}
