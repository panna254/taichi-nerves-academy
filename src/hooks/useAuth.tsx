import { createContext, useContext, useState, ReactNode, useMemo, useEffect } from "react";
import { AuthSession, User } from "@/types/user";

const STORAGE_KEY = "user_auth_session";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  login: (session: AuthSession) => void;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Helper functions for localStorage operations
const saveSession = (session: AuthSession) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch (error) {
    console.error("Failed to save session to localStorage:", error);
  }
};

const loadSession = (): AuthSession | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as AuthSession;
  } catch (error) {
    console.error("Failed to load session from localStorage:", error);
    return null;
  }
};

const clearSession = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear session from localStorage:", error);
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Restore session from localStorage on mount
  useEffect(() => {
    const session = loadSession();
    if (session && session.user && session.token) {
      setUser(session.user);
      setToken(session.token);
    }
  }, []);

  const login = (session: AuthSession) => {
    setUser(session.user);
    setToken(session.token);
    saveSession(session);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    clearSession();
  };

  const isAuthenticated = !!user && !!token;

  const value = useMemo(
    () => ({ user, token, login, logout, isAuthenticated }),
    [user, token, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
