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
