import { useState } from "react";
import { StatutBadge } from "./StatutBadge";
import type { Entry, EntryUpdate, Statut } from "../types/api";

interface EntryCardProps {
  entry: Entry;
  onUpdate: (entryId: number, data: EntryUpdate) => Promise<void>;
  onDelete: (entryId: number) => Promise<void>;
}

export function EntryCard({ entry, onUpdate, onDelete }: EntryCardProps) {
  const [editing, setEditing] = useState(false);
  const [statut, setStatut] = useState<Statut>(entry.statut);
  const [note, setNote] = useState<string>(entry.note !== null ? String(entry.note) : "");
  const [commentaire, setCommentaire] = useState(entry.commentaire ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(): Promise<void> {
    setError(null);
    setIsSaving(true);
    try {
      await onUpdate(entry.id, {
        statut,
        note: note === "" ? undefined : Number(note),
        commentaire: commentaire === "" ? undefined : commentaire,
      });
      setEditing(false);
    } catch {
      setError("Modification impossible.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="card" style={{ display: "flex", gap: "1rem" }}>
      <img
        src={entry.item.image_url}
        alt={entry.item.titre}
        style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 8, flexShrink: 0 }}
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
          <h3 style={{ fontSize: "1rem", margin: 0 }}>{entry.item.titre}</h3>
          {!editing && <StatutBadge statut={entry.statut} />}
        </div>
        <p style={{ fontSize: "0.85rem", color: "var(--color-ink-muted)", margin: "0.3rem 0" }}>
          Ajouté le {new Date(entry.date_ajout).toLocaleDateString("fr-FR")}
        </p>

        {!editing && (
          <>
            {entry.note !== null && <p style={{ margin: "0.2rem 0" }}>Note : {entry.note}/5</p>}
            {entry.commentaire !== null && entry.commentaire !== "" && (
              <p style={{ margin: "0.2rem 0", fontStyle: "italic" }}>« {entry.commentaire} »</p>
            )}
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
              <button type="button" className="btn btn-secondary" onClick={() => setEditing(true)}>
                Modifier
              </button>
              <button type="button" className="btn btn-danger" onClick={() => onDelete(entry.id)}>
                Supprimer
              </button>
            </div>
          </>
        )}

        {editing && (
          <div style={{ marginTop: "0.5rem" }}>
            <div className="field">
              <label htmlFor={`statut-${entry.id}`}>Statut</label>
              <select
                id={`statut-${entry.id}`}
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
              <label htmlFor={`note-${entry.id}`}>Note (1-5)</label>
              <input
                id={`note-${entry.id}`}
                className="input"
                type="number"
                min={1}
                max={5}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor={`commentaire-${entry.id}`}>Commentaire</label>
              <textarea
                id={`commentaire-${entry.id}`}
                className="textarea"
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
              />
            </div>
            {error !== null && <p className="error-text">{error}</p>}
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button type="button" className="btn btn-primary" disabled={isSaving} onClick={handleSave}>
                {isSaving ? "Sauvegarde…" : "Enregistrer"}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}