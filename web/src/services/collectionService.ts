import { apiClient } from "./apiClient";
import type {
  CollectionQueryParams,
  Entry,
  EntryIn,
  EntryUpdate,
  StatsOut,
} from "../types/api";

export const collectionService = {
  list: (token: string, params: CollectionQueryParams = {}) =>
    apiClient.get<Entry[]>("/me/collection", {
      token,
      searchParams: { statut: params.statut, tri: params.tri },
    }),

  add: (token: string, data: EntryIn) =>
    apiClient.post<Entry>("/me/collection", data, { token }),

  update: (token: string, entryId: number, data: EntryUpdate) =>
    apiClient.patch<Entry>(`/me/collection/${entryId}`, data, { token }),

  remove: (token: string, entryId: number) =>
    apiClient.delete<void>(`/me/collection/${entryId}`, { token }),

  stats: (token: string) => apiClient.get<StatsOut>("/me/stats", { token }),
};