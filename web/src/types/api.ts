export type Categorie =
  | "Trappiste"
  | "IPA"
  | "Blonde"
  | "Stout"
  | "Blanche"
  | "Ambrée"
  | "Sour"
  | "Brune"
  | "Triple";

export interface Item {
  id: number;
  titre: string;
  categorie: string; // string côté API 
  description: string;
  image_url: string;
  annee: number;
  brasserie: string;
  degre_alcool: number;
}

export interface ItemListOut {
  total: number;
  page: number;
  limit: number;
  results: Item[];
}

// ---- Collection personnelle ----

export type Statut = "a_decouvrir" | "en_cours" | "termine";

export type Tri = "date" | "note";

export interface Entry {
  id: number;
  statut: Statut;
  note: number | null;
  commentaire: string | null;
  date_ajout: string; // ISO 8601
  item: Item;
}

export interface EntryIn {
  item_id: number;
  statut: Statut;
  note?: number; // 1 à 5
  commentaire?: string;
}

export interface EntryUpdate {
  statut?: Statut;
  note?: number; // 1 à 5
  commentaire?: string;
}

export interface StatsOut {
  total: number;
  par_statut: Record<Statut, number>;
  note_moyenne: number | null;
}

// ---- Authentification ----

export interface RegisterIn {
  email: string;
  password: string;
}

export interface LoginIn {
  email: string;
  password: string;
}

export interface UserOut {
  id: number;
  email: string;
}

export interface TokenOut {
  access_token: string;
  token_type: string;
}

// ---- Erreurs (handler maison) ----

export interface ApiErrorBody {
  erreur: {
    code: number;
    message: string;
  };
}

// ---- Paramètres de requête ----

export interface ItemsQueryParams {
  q?: string;
  categorie?: string;
  page?: number; // >= 1, défaut 1
  limit?: number; // 1-50, défaut 12
}

export interface CollectionQueryParams {
  statut?: Statut;
  tri?: Tri;
}