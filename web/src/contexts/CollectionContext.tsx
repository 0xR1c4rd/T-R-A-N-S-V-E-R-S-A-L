import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { collectionService } from "../services/collectionService";
import { ApiError } from "../services/apiClient";
import { useAuth } from "./AuthContext";
import type { Entry, EntryIn, EntryUpdate, Statut, StatsOut, Tri } from "../types/api";

interface CollectionContextValue {
  entries: Entry[];
  stats: StatsOut | null;
  entriesLoading: boolean;
  entriesError: string | null;
  statsLoading: boolean;
  statsError: string | null;
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
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [entriesError, setEntriesError] = useState<string | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    if (token === null) {
      setEntries([]);
      setStats(null);
      setEntriesError(null);
      setStatsError(null);
    }
  }, [token]);

  const fetchEntries = useCallback(
    async (filtres?: { statut?: Statut; tri?: Tri }) => {
      if (token === null) return;
      setEntriesLoading(true);
      setEntriesError(null);
      try {
        setEntries(await collectionService.list(token, filtres));
      } catch (err) {
        setEntriesError(err instanceof ApiError ? err.message : "Chargement impossible.");
      } finally {
        setEntriesLoading(false);
      }
    },
    [token]
  );

  const fetchStats = useCallback(async () => {
    if (token === null) return;
    setStatsLoading(true);
    setStatsError(null);
    try {
      setStats(await collectionService.stats(token));
    } catch (err) {
      setStatsError(err instanceof ApiError ? err.message : "Chargement des stats impossible.");
    } finally {
      setStatsLoading(false);
    }
  }, [token]);

  const addEntry = useCallback(
    async (data: EntryIn) => {
      if (token === null) throw new Error("Utilisateur non authentifié.");
      const created = await collectionService.add(token, data);
      setEntries((prev) => [...prev, created]);
      setStats(null);
    },
    [token]
  );

  const updateEntry = useCallback(
    async (entryId: number, data: EntryUpdate) => {
      if (token === null) throw new Error("Utilisateur non authentifié.");
      const updated = await collectionService.update(token, entryId, data);
      setEntries((prev) => prev.map((e) => (e.id === entryId ? updated : e)));
      setStats(null);
    },
    [token]
  );

  const removeEntry = useCallback(
    async (entryId: number) => {
      if (token === null) throw new Error("Utilisateur non authentifié.");
      await collectionService.remove(token, entryId);
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
      setStats(null);
    },
    [token]
  );

  const value: CollectionContextValue = {
    entries,
    stats,
    entriesLoading,
    entriesError,
    statsLoading,
    statsError,
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