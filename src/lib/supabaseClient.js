// src/lib/supabaseClient.js
// -----------------------------------------------------------
// IslamQuest — Silent Auth + Identity Binding (Phase 3, Step 3)
// -----------------------------------------------------------
// This client is responsible for:
// 1) Silent account creation on first launch
// 2) Auto-login on every app open
// 3) Permanent Supabase UID for all user data
// 4) Premium restore and multi-device support (Phase 5)
// -----------------------------------------------------------

import { createClient } from "@supabase/supabase-js";

// DO NOT EDIT — these must match your Supabase dashboard
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// -----------------------------------------------------------
// Create the Supabase client
// -----------------------------------------------------------
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// -----------------------------------------------------------
// Silent Identity Generator
// Creates a hidden email + password for anonymous accounts
// -----------------------------------------------------------
function generateHiddenIdentity() {
  const uid = crypto.randomUUID().replace(/-/g, "");
  return {
    email: `iq_user_${uid}@autologin.islamquest`,
    password: crypto.randomUUID() + "_" + Date.now(),
  };
}

// -----------------------------------------------------------
// Silent Sign-In
// Called automatically on app start
// -----------------------------------------------------------

export async function ensureSignedIn() {
  // 1) Check existing session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    console.log("🔐 Supabase: Existing session found");
    return session.user;
  }

  // 2) No session → create or load hidden identity
  let storedIdentity = JSON.parse(localStorage.getItem("iq_hidden_identity_v1"));

  if (!storedIdentity) {
    storedIdentity = generateHiddenIdentity();
    localStorage.setItem(
      "iq_hidden_identity_v1",
      JSON.stringify(storedIdentity)
    );
  }

  // 3) Try to sign in with hidden identity
  const { data: signInData, error: signInError } =
    await supabase.auth.signInWithPassword({
      email: storedIdentity.email,
      password: storedIdentity.password,
    });

  // 4) If user doesn't exist → sign up silently
  if (signInError) {
    console.warn("🔐 Creating NEW Supabase silent account…");

    const { data: signUpData, error: signUpError } =
      await supabase.auth.signUp({
        email: storedIdentity.email,
        password: storedIdentity.password,
      });

    if (signUpError) {
      console.error("❌ Silent signup failed:", signUpError);
      throw signUpError;
    }

    console.log("🆕 Silent account created:", signUpData.user.id);
    return signUpData.user;
  }

  console.log("🔑 Logged in silently:", signInData.user.id);
  return signInData.user;
}

// -----------------------------------------------------------
// Get Current UID (always returns permanent user ID)
// -----------------------------------------------------------
export async function getUID() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.user?.id || null;
}

// -----------------------------------------------------------
// Logout — used later in Phase 5
// -----------------------------------------------------------
export async function logoutUser() {
  await supabase.auth.signOut();
  localStorage.removeItem("iq_hidden_identity_v1");
  window.location.href = "/";
}
