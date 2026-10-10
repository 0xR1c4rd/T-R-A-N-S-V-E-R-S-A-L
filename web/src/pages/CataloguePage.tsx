import { useCallback, useEffect, useState } from "react";
import { itemsService } from "../services/itemsService";
import { ApiError } from "../services/apiClient";
import { useDebounce } from "../hooks/useDebounce";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { SearchBar } from "../components/SearchBar";
import { ItemCard } from "../components/ItemCard";
import { Pagination } from "../components/Pagination";
import { ChargementState, ErreurState, VideState } from "../components/EcranStates";
import type { Item } from "../types/api";

const LIMIT = 12;
type ModeAffichage = "infini" | "classique";

export function CataloguePage() {
  const [q, setQ] = useState("");
  const [categorie, setCategorie] = useState("");
  const [page, setPage] = useState(1);
  const [mode, setMode] = useLocalStorage<ModeAffichage>("catalogue_mode", "infini");

  const [items, setItems] = useState<Item[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const qDebounced = useDebounce(q, 400);

  // Nouvelle recherche, nouveau filtre, ou changement de mode : on repart de zéro.
  useEffect(() => {
    setItems([]);
    setPage(1);
    setError(null);
  }, [qDebounced, categorie, mode]);

  useEffect(() => {
    let annule = false;
    // En mode classique, chaque page remplace la précédente.
    // En mode infini, seule la page 1 remplace ; les suivantes s'accumulent.
    const remplace = mode === "classique" || page === 1;
    if (remplace) {
      setIsLoadingInitial(true);
    } else {
      setIsLoadingMore(true);
    }
    setError(null);

    itemsService
      .list({
        q: qDebounced.length >= 2 ? qDebounced : undefined,
        categorie: categorie || undefined,
        page,
        limit: LIMIT,
      })
      .then((data) => {
        if (annule) return;
        setItems((prev) => (remplace ? data.results : [...prev, ...data.results]));
        setTotal(data.total);
      })
      .catch((err: unknown) => {
        if (annule) return;
        setError(err instanceof ApiError ? err.message : "Chargement du catalogue impossible.");
      })
      .finally(() => {
        if (annule) return;
        setIsLoadingInitial(false);
        setIsLoadingMore(false);
      });

    return () => {
      annule = true;
    };
  }, [qDebounced, categorie, page, mode]);

  const hasMore = items.length < total;

  const chargerPageSuivante = useCallback(() => {
    setPage((p) => p + 1);
  }, []);

  const sentinelRef = useInfiniteScroll(chargerPageSuivante, {
    hasMore,
    isLoading: mode !== "infini" || isLoadingInitial || isLoadingMore,
  });

  return (
    <div className="container">
      <h1 className="page-title">Le catalogue</h1>
      <div style={{ marginTop: "1.25rem" }}>
        <SearchBar q={q} onQChange={setQ} categorie={categorie} onCategorieChange={setCategorie} />
      </div>

      <div style={{ display: "flex", gap: "0.5rem", margin: "0 0 1.25rem" }}>
        <button
          type="button"
          className={mode === "infini" ? "btn btn-primary" : "btn btn-secondary"}
          onClick={() => setMode("infini")}
        >
          Défilement infini
        </button>
        <button
          type="button"
          className={mode === "classique" ? "btn btn-primary" : "btn btn-secondary"}
          onClick={() => setMode("classique")}
        >
          Pagination classique
        </button>
      </div>

      {isLoadingInitial && <ChargementState message="Recherche des bières…" />}
      {!isLoadingInitial && error !== null && items.length === 0 && <ErreurState message={error} />}
      {!isLoadingInitial && error === null && items.length === 0 && (
        <VideState message="Aucune bière ne correspond à votre recherche." />
      )}
      {!isLoadingInitial && items.length > 0 && (
        <>
          <div className="grid-items">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>

          {mode === "infini" && (
            <>
              <div ref={sentinelRef} style={{ height: 1 }} />
              {isLoadingMore && <ChargementState message="Chargement d'autres bières…" />}
              {!hasMore && !isLoadingMore && (
                <p style={{ textAlign: "center", color: "var(--color-ink-muted)", marginTop: "1.5rem" }}>
                  Vous avez atteint la fin du catalogue ({total} bières au total).
                </p>
              )}
            </>
          )}

          {mode === "classique" && (
            <Pagination page={page} limit={LIMIT} total={total} onPageChange={setPage} />
          )}

          {error !== null && items.length > 0 && (
            <p className="error-text" style={{ textAlign: "center", marginTop: "1rem" }}>
              {error}
            </p>
          )}
        </>
      )}
    </div>
  );
}