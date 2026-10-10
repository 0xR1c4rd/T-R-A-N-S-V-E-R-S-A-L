import { useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";

export type Theme = "clair" | "sombre";

/** Thème préféré du système d'exploitation, utilisé tant que l'utilisateur n'a rien choisi. */
function themeSysteme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "sombre" : "clair";
}

/**
 * Gère le thème clair / sombre : le choix est mémorisé dans le localStorage
 * et appliqué sur la balise <html> via l'attribut data-theme, que le CSS
 * utilise pour changer toutes les variables de couleur d'un coup.
 */
export function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useLocalStorage<Theme>("theme", themeSysteme());

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  function basculer(): void {
    setTheme(theme === "clair" ? "sombre" : "clair");
  }

  return [theme, basculer];
}