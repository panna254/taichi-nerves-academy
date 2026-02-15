import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/config/supabase";

/**
 * Supabase client for Auth, Database, Storage, and Realtime.
 * Used as the single backend for the TypeScript web app.
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
