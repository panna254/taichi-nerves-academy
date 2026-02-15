import { createContext, useContext, useState, ReactNode, useMemo, useEffect } from "react";
import type { Session } from "@supabase/supabase-js";
import { AuthSession, User } from "@/types/user";
import { supabase } from "@/lib/supabase";
import { mapSupabaseUserToUser } from "@/services/userApi";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  login: (session: AuthSession) => void;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const setSession = (session: Session | null) => {
    if (!session?.user) {
      setUser(null);
      setToken(null);
      return;
    }
    setUser(mapSupabaseUserToUser(session.user));
    setToken(session.access_token);
  };

  // Restore session from Supabase on mount and subscribe to auth changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = (session: AuthSession) => {
    setUser(session.user);
    setToken(session.token);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setToken(null);
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
