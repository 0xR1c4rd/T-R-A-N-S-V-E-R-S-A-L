import { apiClient } from "./apiClient";
import type { Item, ItemListOut, ItemsQueryParams } from "../types/api";

export const itemsService = {
  list: (params: ItemsQueryParams = {}) =>
    apiClient.get<ItemListOut>("/items", {
      searchParams: {
        q: params.q,
        categorie: params.categorie,
        page: params.page ?? 1,
        limit: params.limit ?? 12,
      },
    }),

  getById: (itemId: number) => apiClient.get<Item>(`/items/${itemId}`),
};