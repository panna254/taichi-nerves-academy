import { createContext, useContext, useState, ReactNode, useMemo, useEffect } from "react";
import type { Session } from "@supabase/supabase-js";
import { AuthSession, User } from "@/types/user";
import { supabase } from "@/lib/supabase";
import { mapSupabaseUserToUser } from "@/services/userApi";
import { isSupabaseConfigured } from "@/config/supabase";

type MembershipStatus = 'free' | 'premium' | 'expired' | 'inactive' | null;

interface AuthContextValue {
  user: User | null;
  token: string | null;
  membershipStatus: MembershipStatus;
  isLoading: boolean;
  isInitializing: boolean;
  isLoggingOut: boolean;
  isAuthenticated: boolean;
  login: (session: AuthSession) => Promise<void>;
  logout: () => Promise<void>;
  refreshMembership: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [membershipStatus, setMembershipStatus] = useState<MembershipStatus>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      console.warn("Supabase not configured. Authentication features will be limited.");
      setIsLoading(false);
      setIsInitializing(false);
      return;
    }

    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted && session?.user && session?.access_token) {
          const mappedUser = mapSupabaseUserToUser(session.user);
          setUser(mappedUser);
          setToken(session.access_token);
          
          // Fetch membership status asynchronously without blocking
          fetchMembershipStatus(session.user.id).catch(error => {
            console.warn('Failed to fetch membership status during init:', error);
          });
        } else if (mounted) {
          setUser(null);
          setToken(null);
          setMembershipStatus(null);
        }
      } catch (error) {
        console.error("Failed to initialize authentication:", error);
        if (mounted) {
          setUser(null);
          setToken(null);
          setMembershipStatus(null);
        }
      } finally {
        // Always set both loading states to false after initialization
        if (mounted) {
          setIsLoading(false);
          setIsInitializing(false);
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log(`Auth state changed: ${event}`, session ? `User: ${session.user.email}` : 'No session');
        
        if (event === 'SIGNED_IN' && session?.user && session?.access_token) {
          const mappedUser = mapSupabaseUserToUser(session.user);
          setUser(mappedUser);
          setToken(session.access_token);
          
          // Fetch membership status asynchronously without blocking
          fetchMembershipStatus(session.user.id).catch(error => {
            console.warn('Failed to fetch membership status on sign in:', error);
          });
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setToken(null);
          setMembershipStatus(null);
        } else if (event === 'TOKEN_REFRESHED' && session?.user && session?.access_token) {
          setToken(session.access_token);
        }
      }
    );

    initializeAuth();

    return () => {
      mounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

const fetchMembershipStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('membership_status, membership_expires_at')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('Failed to fetch membership status:', error);
        setMembershipStatus('free'); 
        return;
      }

      if (data) {
        const now = new Date();
        const expiresAt = data.membership_expires_at ? new Date(data.membership_expires_at) : null;
        
        if (expiresAt && expiresAt < now) {
          setMembershipStatus('expired');
        } else if (data.membership_status) {
          setMembershipStatus(data.membership_status);
        } else {
          setMembershipStatus('free');
        }
      }
    } catch (error) {
      console.error('Error fetching membership status:', error);
      setMembershipStatus('free');
    }
  };

  const login = async (session: AuthSession) => {
    try {
      setUser(session.user);
      setToken(session.token);
      
      // Fetch membership status asynchronously without blocking login
      fetchMembershipStatus(session.user.id).catch(error => {
        console.warn('Failed to fetch membership status on login:', error);
      });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    if (!isSupabaseConfigured) {
      console.warn("⚠️ Supabase not configured. Cannot logout.");
      setUser(null);
      setToken(null);
      setMembershipStatus(null);
      return;
    }
    
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Failed to sign out:", error);
    } finally {
      // Explicitly clear all state in finally block
      setUser(null);
      setToken(null);
      setMembershipStatus(null);
      setIsLoggingOut(false);
      // Ensure isLoading is also false after logout
      setIsLoading(false);
    }
  };

  const refreshMembership = async () => {
    const currentUser = user;
    if (currentUser) {
      await fetchMembershipStatus(currentUser.id);
    }
  };

const value = useMemo(() => ({ 
    user, 
    token, 
    membershipStatus,
    isLoading, 
    isInitializing,
    isLoggingOut,
    isAuthenticated: !!user,
    login, 
    logout,
    refreshMembership 
  }), [user, token, membershipStatus, isLoading, isInitializing, isLoggingOut]);

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
      membershipStatus: null,
      isLoading: false,
      isInitializing: false,
      isLoggingOut: false,
      login: () => console.warn("Auth not available"),
      logout: () => console.warn("Auth not available"),
      isAuthenticated: false,
      refreshMembership: () => console.warn("Auth not available"),
    };
  }
  return ctx;
};
