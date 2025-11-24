// src/lib/userProfile.js
// -------------------------------------------------------
// Phase 3 – Permanent Cloud Users + Profile Auto-Creation
// -------------------------------------------------------

import { supabase } from "./supabaseClient";

/**
 * 🔹 ensureSignedIn()
 * Silent authentication:
 * - Creates a hidden Supabase user account on first launch
 * - Returns a permanent user ID
 */
export async function ensureSignedIn() {
  // 1) Check existing session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user) {
    return session.user;
  }

  // 2) Create a new hidden account
  const {
    data: { user },
    error,
  } = await supabase.auth.signUp({
    email: `hidden_${crypto.randomUUID()}@hidden.local`,
    password: crypto.randomUUID(),
  });

  if (error) {
    console.error("Silent sign-up failed:", error);
    return null;
  }

  return user;
}

/**
 * 🔹 ensureProfile(userId)
 * Creates a profile row in the public.profiles table if missing.
 */
export async function ensureProfile(userId) {
  if (!userId) return;

  // Does profile already exist?
  const { data: existing, error: selectErr } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .single();

  // Exists → no action needed
  if (existing) return;

  // Insert new profile
  const { error: insertErr } = await supabase.from("profiles").insert({
    id: userId,
    username: null,
    display_name: null,
    avatar: null,
    xp: 0,
    coins: 0,
    streak: 0,
  });

  if (insertErr) {
    console.error("Profile creation failed:", insertErr);
  }
}

/**
 * 🔹 loadCloudProfile(userId)
 * Reads the cloud profile into JS (used later in Phase 4).
 */
export async function loadCloudProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Failed to load cloud profile:", error);
    return null;
  }

  return data;
}

/**
 * 🔹 saveCloudProfile(userId, partialData)
 * Updates only the given fields.
 */
export async function saveCloudProfile(userId, partialData) {
  if (!userId) return;

  const { error } = await supabase
    .from("profiles")
    .update(partialData)
    .eq("id", userId);

  if (error) {
    console.error("Failed to save cloud profile:", error);
  }
}
