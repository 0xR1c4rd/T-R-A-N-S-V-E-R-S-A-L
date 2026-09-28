import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout(): void {
    logout();
    navigate("/");
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        🍺 Ma Collection
      </Link>
      <div className="navbar-links">
        <Link to="/">Catalogue</Link>
        {isAuthenticated ? (
          <>
            <Link to="/collection">Ma collection</Link>
            <Link to="/stats">Statistiques</Link>
            <span style={{ color: "var(--color-ink-muted)", fontSize: "0.9rem" }}>{user?.email}</span>
            <button type="button" className="btn btn-secondary" onClick={handleLogout}>
              Déconnexion
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Connexion</Link>
            <Link to="/register">Inscription</Link>
          </>
        )}
      </div>
    </nav>
  );
}