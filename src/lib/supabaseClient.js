// src/lib/supabaseClient.js

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

/**
 * Returns the current session user, or null if no session exists.
 * Does NOT create any anonymous or hidden accounts.
 */
export async function ensureSignedIn() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) {
    console.log("🔐 Supabase: Existing session found");
    return session.user;
  }
  return null;
}

export async function getUID() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id || null;
}

export async function logoutUser() {
  await supabase.auth.signOut();
  window.location.href = "/";
}
