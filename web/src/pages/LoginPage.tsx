import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ApiError } from "../services/apiClient";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate("/collection");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Connexion impossible.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container">
      <div className="card form-narrow">
        <h1 className="page-title">Connexion</h1>
        <form onSubmit={handleSubmit} style={{ marginTop: "1.25rem" }}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              className="input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              className="input"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error !== null && <p className="error-text">{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ width: "100%" }}>
            {isSubmitting ? "Connexion…" : "Se connecter"}
          </button>
        </form>
        <p style={{ marginTop: "1rem", fontSize: "0.9rem" }}>
          Pas encore de compte ? <Link to="/register">S'inscrire</Link>
        </p>
      </div>
    </div>
  );
}
