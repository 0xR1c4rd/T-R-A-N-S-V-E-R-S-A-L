import { CATEGORIES } from "../constants/categories";

interface SearchBarProps {
  q: string;
  onQChange: (v: string) => void;
  categorie: string;
  onCategorieChange: (v: string) => void;
}

export function SearchBar({ q, onQChange, categorie, onCategorieChange }: SearchBarProps) {
  return (
    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
      <input
        className="input"
        type="search"
        placeholder="Rechercher une bière…"
        value={q}
        onChange={(e) => onQChange(e.target.value)}
        style={{ flex: "1 1 220px" }}
        aria-label="Rechercher par mot-clé"
      />
      <select
        className="select"
        value={categorie}
        onChange={(e) => onCategorieChange(e.target.value)}
        aria-label="Filtrer par catégorie"
      >
        <option value="">Toutes catégories</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </div>
  );
}
