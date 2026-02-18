/**
 * Supabase configuration
 *
 * Backend and database are handled by Supabase.
 * Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env
 */

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL.startsWith("http")
);

// Development fallback configuration
export const getSupabaseConfig = () => {
  if (!isSupabaseConfigured) {
    console.warn(
      "⚠️ Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file. " +
      "Using mock configuration for development."
    );
    return {
      url: "https://demo.supabase.co",
      anonKey: "demo-key"
    };
  }
  return {
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY
  };
};
