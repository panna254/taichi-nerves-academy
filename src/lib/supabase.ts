import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/config/supabase";

/**
 * Supabase client for Auth, Database, Storage, and Realtime.
 * Used as the single backend for the TypeScript web app.
 */
const config = getSupabaseConfig();
export const supabase = createClient(config.url, config.anonKey);
