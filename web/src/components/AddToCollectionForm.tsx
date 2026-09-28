import { useState } from "react";
import { useCollection } from "../contexts/CollectionContext";
import { ApiError } from "../services/apiClient";
import type { Statut } from "../types/api";

interface AddToCollectionFormProps {
  itemId: number;
}

export function AddToCollectionForm({ itemId }: AddToCollectionFormProps) {
  const { addEntry } = useCollection();

  const [statut, setStatut] = useState<Statut>("a_decouvrir");
  const [note, setNote] = useState<string>("");
  const [commentaire, setCommentaire] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleAjouter(): Promise<void> {
    setMessage(null);
    setErreur(null);
    setIsSubmitting(true);
    try {
      await addEntry({
        item_id: itemId,
        statut,
        note: note === "" ? undefined : Number(note),
        commentaire: commentaire === "" ? undefined : commentaire,
      });
      setMessage("Ajouté à votre collection !");
    } catch (err) {
      setErreur(err instanceof ApiError ? err.message : "Ajout impossible.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
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
      {erreur !== null && <p className="error-text">{erreur}</p>}
      {message !== null && <p style={{ color: "var(--color-success)" }}>{message}</p>}
      <button type="button" className="btn btn-primary" disabled={isSubmitting} onClick={handleAjouter}>
        {isSubmitting ? "Ajout…" : "Ajouter"}
      </button>
    </div>
  );
}