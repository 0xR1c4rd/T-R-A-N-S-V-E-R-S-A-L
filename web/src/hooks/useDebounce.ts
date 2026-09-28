import { useEffect, useState } from "react";

/**
 * Retourne une version "retardée" de `valeur`, qui ne se met à jour
 * que `delaiMs` millisecondes après la dernière modification.
 * Utilisé sur le champ de recherche du catalogue (debounce ~400ms).
 */
export function useDebounce<T>(valeur: T, delaiMs = 400): T {
  const [valeurDebattue, setValeurDebattue] = useState<T>(valeur);

  useEffect(() => {
    const timer = setTimeout(() => {
      setValeurDebattue(valeur);
    }, delaiMs);

    return () => clearTimeout(timer);
  }, [valeur, delaiMs]);

  return valeurDebattue;
}