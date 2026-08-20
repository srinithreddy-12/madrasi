import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Browser Supabase client (singleton). Reads the public keys from .env.local.
// These are inlined at build time because they are prefixed NEXT_PUBLIC_.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and " +
      "NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.",
  );
}

// Cache the client across HMR reloads in dev so we don't spawn multiple
// GoTrue instances (which warns and can desync auth state).
const globalForSupabase = globalThis as unknown as {
  __madrasiSupabase?: SupabaseClient;
};

export const supabase: SupabaseClient =
  globalForSupabase.__madrasiSupabase ??
  createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForSupabase.__madrasiSupabase = supabase;
}
