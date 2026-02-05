import { createContext, useContext, useState, ReactNode, useMemo, useEffect } from "react";
import { AuthSession, User } from "@/types/admin";

const STORAGE_KEY = "admin_auth_session";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  login: (session: AuthSession) => void;
  logout: () => void;
};

const AdminAuthContext = createContext<AuthContextValue | undefined>(undefined);

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

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
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

  const value = useMemo(() => ({ user, token, login, logout }), [user, token]);

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return ctx;
};



