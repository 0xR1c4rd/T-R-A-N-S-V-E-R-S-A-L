import { useEffect, useState } from "react";
import { itemsService } from "../services/itemsService";
import { ApiError } from "../services/apiClient";
import { useDebounce } from "../hooks/useDebounce";
import { SearchBar } from "../components/SearchBar";
import { ItemCard } from "../components/ItemCard";
import { Pagination } from "../components/Pagination";
import { ChargementState, ErreurState, VideState } from "../components/EcranStates";
import type { Item } from "../types/api";

export function CataloguePage() {
  const [q, setQ] = useState("");
  const [categorie, setCategorie] = useState("");
  const [page, setPage] = useState(1);
  const limit = 12;

  const [items, setItems] = useState<Item[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const qDebounced = useDebounce(q, 400);

  useEffect(() => {
    setPage(1);
  }, [qDebounced, categorie]);

  useEffect(() => {
    let annule = false;
    setIsLoading(true);
    setError(null);

    itemsService
      .list({
        q: qDebounced.length >= 2 ? qDebounced : undefined,
        categorie: categorie || undefined,
        page,
        limit,
      })
      .then((data) => {
        if (annule) return;
        setItems(data.results);
        setTotal(data.total);
      })
      .catch((err: unknown) => {
        if (annule) return;
        setError(err instanceof ApiError ? err.message : "Chargement du catalogue impossible.");
      })
      .finally(() => {
        if (!annule) setIsLoading(false);
      });

    return () => {
      annule = true;
    };
  }, [qDebounced, categorie, page]);

  return (
    <div className="container">
      <h1 className="page-title">Le catalogue</h1>
      <div style={{ marginTop: "1.25rem" }}>
        <SearchBar q={q} onQChange={setQ} categorie={categorie} onCategorieChange={setCategorie} />
      </div>

      {isLoading && <ChargementState message="Recherche des bières…" />}
      {!isLoading && error !== null && <ErreurState message={error} />}
      {!isLoading && error === null && items.length === 0 && (
        <VideState message="Aucune bière ne correspond à votre recherche." />
      )}
      {!isLoading && error === null && items.length > 0 && (
        <>
          <div className="grid-items">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
          <Pagination page={page} limit={limit} total={total} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
