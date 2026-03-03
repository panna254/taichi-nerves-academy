import { AuthSession, LoginData, SignupData, SignupResult, User } from "@/types/user";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

/**
 * Map Supabase Auth user to app User type (exported for use in useAuth)
 */
export function mapSupabaseUserToUser(sbUser: SupabaseUser): User {
  const metadata = (sbUser.user_metadata ?? {}) as Record<string, unknown>;
  const name = (metadata.full_name as string) ?? (metadata.name as string) ?? sbUser.email?.split("@")[0] ?? "User";
  return {
    id: sbUser.id,
    email: sbUser.email ?? "",
    name,
    avatar: sbUser.user_metadata?.avatar_url as string | undefined,
    membershipStatus: "active",
    membershipExpiresAt: undefined,
    createdAt: sbUser.created_at,
  };
}

/**
 * User API – Supabase Auth + optional profiles.
 * All user emails and passwords are stored and validated by Supabase.
 */
export const userApi = {
  /**
   * Sign in with email and password (Supabase Auth)
   */
  async login(credentials: LoginData): Promise<AuthSession> {
    const email = credentials.email.trim().toLowerCase();
    const password = credentials.password;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        throw new Error("Invalid email or password");
      }
      if (error.message.toLowerCase().includes("email not confirmed")) {
        throw new Error("Please confirm your email address before signing in.");
      }
      throw new Error(error.message || "Failed to sign in");
    }

    if (!data.session || !data.user) {
      throw new Error("Failed to sign in");
    }

    return {
      token: data.session.access_token,
      user: mapSupabaseUserToUser(data.user),
    };
  },

  /**
   * Sign up with name, email, and password (Supabase Auth).
   * Name is stored in user_metadata; passwords are hashed by Supabase.
   */
  async signup(data: SignupData): Promise<SignupResult> {
    if (data.password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }
    const normalizedEmail = data.email.trim().toLowerCase();
    const normalizedName = data.name.trim();

    const { data: authData, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: data.password,
      options: {
        data: {
          full_name: normalizedName,
          name: normalizedName,
        },
      },
    });

    if (error) {
      if (error.message.includes("already registered")) {
        throw new Error("An account with this email already exists");
      }
      throw new Error(error.message || "Failed to create account");
    }

    if (!authData.user) {
      throw new Error("Failed to create account");
    }

    if (!authData.session) {
      // Email confirmation may be enabled; user exists but sign-in must wait for confirmation
      return {
        status: "email_confirmation_required",
        email: authData.user.email ?? normalizedEmail,
        message: "Account created. Please check your email to confirm your account before signing in.",
      };
    }

    return {
      status: "authenticated",
      session: {
        token: authData.session.access_token,
        user: mapSupabaseUserToUser(authData.user),
      },
    };
  },

  /**
   * Get current user from Supabase session
   */
  async getCurrentUser(): Promise<User | null> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;
    return mapSupabaseUserToUser(session.user);
  },

  /**
   * Sign out (Supabase Auth)
   */
  async logout(): Promise<void> {
    await supabase.auth.signOut();
  },
};
