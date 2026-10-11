import { useCallback, useState } from "react";

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

  const setValeurPersistee = useCallback(
    (nouvelleValeur: T): void => {
      setValeur(nouvelleValeur);
      try {
        window.localStorage.setItem(cle, JSON.stringify(nouvelleValeur));
      } catch {
      }
    },
    [cle]
  );

  return [valeur, setValeurPersistee];
}