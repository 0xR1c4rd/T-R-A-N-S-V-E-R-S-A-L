import { useState } from "react";

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