import { useTheme } from "../hooks/useTheme";

export function ThemeToggle() {
  const [theme, basculer] = useTheme();
  const versSombre = theme === "clair";

  return (
    <button
      type="button"
      className="btn btn-secondary"
      onClick={basculer}
      aria-label={versSombre ? "Passer au thème sombre" : "Passer au thème clair"}
    >
      {versSombre ? "Thème sombre" : "Thème clair"}
    </button>
  );
}