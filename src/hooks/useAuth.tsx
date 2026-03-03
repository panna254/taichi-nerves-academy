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
<<<<<<< HEAD
  isLoading: boolean;
};
=======
  login: (session: AuthSession) => Promise<void>;
  logout: () => Promise<void>;
  refreshMembership: () => Promise<void>;
}
>>>>>>> 948e0e401bd162f7de6c426c768fdf487f47fa02

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
<<<<<<< HEAD
  const [isLoading, setIsLoading] = useState(true);

  const setSession = (session: Session | null) => {
    if (!session?.user) {
      setUser(null);
      setToken(null);
      return;
    }
    setUser(mapSupabaseUserToUser(session.user));
    setToken(session.access_token);
  };

  // Restore session from Supabase on mount and subscribe to auth changes.
=======
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [membershipStatus, setMembershipStatus] = useState<MembershipStatus>(null);

>>>>>>> 948e0e401bd162f7de6c426c768fdf487f47fa02
  useEffect(() => {
    if (!isSupabaseConfigured) {
      console.warn("Supabase not configured. Authentication features will be limited.");
      setIsLoading(false);
      return;
    }

    let mounted = true;

    const initializeAuth = async () => {
      try {
<<<<<<< HEAD
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (mounted) {
          setSession(session);
          setIsLoading(false);
=======
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted && session?.user && session?.access_token) {
          const mappedUser = mapSupabaseUserToUser(session.user);
          setUser(mappedUser);
          setToken(session.access_token);
          
          await fetchMembershipStatus(session.user.id);
        } else if (mounted) {
          setUser(null);
          setToken(null);
          setMembershipStatus(null);
>>>>>>> 948e0e401bd162f7de6c426c768fdf487f47fa02
        }
      } catch (error) {
        console.error("Failed to initialize authentication:", error);
        if (mounted) {
<<<<<<< HEAD
          setSession(null);
          setIsLoading(false);
=======
          setUser(null);
          setToken(null);
          setMembershipStatus(null);
>>>>>>> 948e0e401bd162f7de6c426c768fdf487f47fa02
        }
      } finally {
        setIsInitializing(false);
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
          await fetchMembershipStatus(session.user.id);
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

<<<<<<< HEAD
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSession(session);
        setIsLoading(false);
      }
    });

=======
>>>>>>> 948e0e401bd162f7de6c426c768fdf487f47fa02
    return () => {
      mounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

<<<<<<< HEAD
  const login = (session: AuthSession) => {
    setUser(session.user);
    setToken(session.token);
    setIsLoading(false);
=======
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
    setIsLoading(true);
    try {
      setUser(session.user);
      setToken(session.token);
      await fetchMembershipStatus(session.user.id);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
>>>>>>> 948e0e401bd162f7de6c426c768fdf487f47fa02
  };

  const logout = async () => {
    if (!isSupabaseConfigured) {
      console.warn("Supabase not configured. Cannot logout.");
      setUser(null);
      setToken(null);
<<<<<<< HEAD
      setIsLoading(false);
      return;
    }

=======
      setMembershipStatus(null);
      return;
    }
    
    setIsLoggingOut(true);
>>>>>>> 948e0e401bd162f7de6c426c768fdf487f47fa02
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Failed to sign out:", error);
    } finally {
      setUser(null);
      setToken(null);
<<<<<<< HEAD
      setIsLoading(false);
=======
      setMembershipStatus(null);
      setIsLoggingOut(false);
>>>>>>> 948e0e401bd162f7de6c426c768fdf487f47fa02
    }
  };

  const refreshMembership = async () => {
    const currentUser = user;
    if (currentUser) {
      await fetchMembershipStatus(currentUser.id);
    }
  };

<<<<<<< HEAD
  const value = useMemo(
    () => ({ user, token, login, logout, isAuthenticated, isLoading }),
    [user, token, isAuthenticated, isLoading]
  );
=======
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
>>>>>>> 948e0e401bd162f7de6c426c768fdf487f47fa02

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
<<<<<<< HEAD
      isLoading: false,
=======
      refreshMembership: () => console.warn("Auth not available"),
>>>>>>> 948e0e401bd162f7de6c426c768fdf487f47fa02
    };
  }
  return ctx;
};
