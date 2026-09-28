import { useState } from "react";

/**
 * Hook générique de persistance dans le localStorage.
 * Signature imposée par le sujet (section 6.1).
 *
 * Note sécurité : stocker le token JWT ici est pratique mais expose au XSS
 * (un script injecté peut lire le localStorage). L'alternative plus sûre est
 * un cookie httpOnly + Secure, géré côté serveur — à savoir expliquer en soutenance.
 */
export function useLocalStorage<T>(
  cle: string,
  valeurInitiale: T
): [T, (v: T) => void] {
  const [valeur, setValeur] = useState<T>(() => {
    try {
      const stocke = window.localStorage.getItem(cle);
      return stocke !== null ? (JSON.parse(stocke) as T) : valeurInitiale;
    } catch {
      return valeurInitiale;
    }
  });

  const setValeurPersistee = (nouvelleValeur: T): void => {
    setValeur(nouvelleValeur);
    try {
      window.localStorage.setItem(cle, JSON.stringify(nouvelleValeur));
    } catch {
      // Stockage indisponible (navigation privée, quota atteint...) : on ignore.
    }
  };

  return [valeur, setValeurPersistee];
}