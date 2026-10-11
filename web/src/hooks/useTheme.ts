import { useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";

export type Theme = "clair" | "sombre";

function themeSysteme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "sombre" : "clair";
}

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