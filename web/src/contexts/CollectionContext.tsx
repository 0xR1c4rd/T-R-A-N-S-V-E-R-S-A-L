import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { collectionService } from "../services/collectionService";
import { ApiError } from "../services/apiClient";
import { useAuth } from "./AuthContext";
import type { Entry, EntryIn, EntryUpdate, Statut, StatsOut, Tri } from "../types/api";

interface CollectionContextValue {
  entries: Entry[];
  stats: StatsOut | null;
  isLoading: boolean;
  error: string | null;
  fetchEntries: (filtres?: { statut?: Statut; tri?: Tri }) => Promise<void>;
  addEntry: (data: EntryIn) => Promise<void>;
  updateEntry: (entryId: number, data: EntryUpdate) => Promise<void>;
  removeEntry: (entryId: number) => Promise<void>;
  fetchStats: () => Promise<void>;
}

const CollectionContext = createContext<CollectionContextValue | null>(null);

export function CollectionProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [stats, setStats] = useState<StatsOut | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function requireToken(): string {
    if (token === null) {
      throw new Error("Utilisateur non authentifié.");
    }
    return token;
  }

  const fetchEntries = useCallback(
    async (filtres?: { statut?: Statut; tri?: Tri }) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await collectionService.list(requireToken(), filtres);
        setEntries(data);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Chargement impossible.");
      } finally {
        setIsLoading(false);
      }
    },
    [token]
  );

  const addEntry = useCallback(
    async (data: EntryIn) => {
      setError(null);
      try {
        const created = await collectionService.add(requireToken(), data);
        setEntries((prev) => [...prev, created]);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Ajout impossible.");
        throw err;
      }
    },
    [token]
  );

  const updateEntry = useCallback(
    async (entryId: number, data: EntryUpdate) => {
      setError(null);
      try {
        const updated = await collectionService.update(requireToken(), entryId, data);
        setEntries((prev) => prev.map((e) => (e.id === entryId ? updated : e)));
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Modification impossible.");
        throw err;
      }
    },
    [token]
  );

  const removeEntry = useCallback(
    async (entryId: number) => {
      setError(null);
      try {
        await collectionService.remove(requireToken(), entryId);
        setEntries((prev) => prev.filter((e) => e.id !== entryId));
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Suppression impossible.");
        throw err;
      }
    },
    [token]
  );

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await collectionService.stats(requireToken());
      setStats(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Chargement des stats impossible.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const value: CollectionContextValue = {
    entries,
    stats,
    isLoading,
    error,
    fetchEntries,
    addEntry,
    updateEntry,
    removeEntry,
    fetchStats,
  };

  return (
    <CollectionContext.Provider value={value}>{children}</CollectionContext.Provider>
  );
}

export function useCollection(): CollectionContextValue {
  const context = useContext(CollectionContext);
  if (context === null) {
    throw new Error(
      "useCollection doit être utilisé à l'intérieur d'un <CollectionProvider>."
    );
  }
  return context;
}
