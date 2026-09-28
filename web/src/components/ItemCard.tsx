import { Link } from "react-router-dom";
import type { Item } from "../types/api";

interface ItemCardProps {
  item: Item;
}

export function ItemCard({ item }: ItemCardProps) {
  return (
    <Link to={`/items/${item.id}`} className="card" style={{ textDecoration: "none", color: "inherit" }}>
      <img
        src={item.image_url}
        alt={item.titre}
        loading="lazy"
        style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 8, marginBottom: "0.6rem" }}
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
      <h3 style={{ fontSize: "1.05rem", marginBottom: "0.2rem" }}>{item.titre}</h3>
      <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--color-ink-muted)" }}>
        {item.brasserie} · {item.annee}
      </p>
      <p style={{ margin: "0.4rem 0 0", fontSize: "0.85rem" }}>
        {item.categorie} · {item.degre_alcool.toFixed(1)}°
      </p>
    </Link>
  );
}
