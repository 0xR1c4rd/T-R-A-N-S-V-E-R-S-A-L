import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { authService } from "../services/authService";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { ApiError } from "../services/apiClient";
import type { UserOut } from "../types/api";

interface AuthContextValue {
  token: string | null;
  user: UserOut | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useLocalStorage<string | null>("auth_token", null);
  const [user, setUser] = useState<UserOut | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const { access_token } = await authService.login({ email, password });
        const currentUser = await authService.me(access_token);
        setToken(access_token);
        setUser(currentUser);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Connexion impossible.");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [setToken]
  );

  const register = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      setError(null);
      try {
        await authService.register({ email, password });
        await login(email, password);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Inscription impossible.");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [login]
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, [setToken]);

  useEffect(() => {
    if (token !== null && user === null) {
      authService
        .me(token)
        .then(setUser)
        .catch(() => {
          setToken(null);
        });
    }
  }, [token]);

  const value: AuthContextValue = {
    token,
    user,
    isAuthenticated: token !== null,
    isLoading,
    error,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un <AuthProvider>.");
  }
  return context;
}
