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
 * Returns the current authenticated user after server-side JWT verification,
 * or null if no valid session exists.
 * Uses getUser() (not getSession()) so the token is always verified with the
 * Supabase Auth server — never trusts a locally cached JWT blindly.
 */
export async function ensureSignedIn() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (user && !error) {
    console.log("🔐 Supabase: Session verified with server");
    return user;
  }
  return null;
}

export async function getUID() {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

export async function logoutUser() {
  await supabase.auth.signOut();
  window.location.href = "/";
}
