import { useEffect, useState } from "react";

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