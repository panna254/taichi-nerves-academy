import { createContext, useContext, useState, ReactNode, useMemo, useEffect } from "react";
import type { Session } from "@supabase/supabase-js";
import { AuthSession, User } from "@/types/user";
import { supabase } from "@/lib/supabase";
import { mapSupabaseUserToUser } from "@/services/userApi";
import { isSupabaseConfigured } from "@/config/supabase";

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
    if (!isSupabaseConfigured) {
      console.warn("⚠️ Supabase not configured. Authentication features will be limited.");
      return;
    }

    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(session);
        }
      } catch (error) {
        console.error("Failed to initialize authentication:", error);
        if (mounted) {
          setSession(null);
        }
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSession(session);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = (session: AuthSession) => {
    setUser(session.user);
    setToken(session.token);
  };

  const logout = async () => {
    if (!isSupabaseConfigured) {
      console.warn("⚠️ Supabase not configured. Cannot logout.");
      setUser(null);
      setToken(null);
      return;
    }
    
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Failed to sign out:", error);
    } finally {
      setUser(null);
      setToken(null);
    }
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
    // Instead of throwing an error, return a safe default
    console.warn("useAuth must be used within AuthProvider, returning safe defaults");
    return {
      user: null,
      token: null,
      login: () => console.warn("Auth not available"),
      logout: () => console.warn("Auth not available"),
      isAuthenticated: false,
    };
  }
  return ctx;
};
