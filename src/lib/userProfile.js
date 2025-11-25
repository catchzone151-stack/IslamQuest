// src/lib/userProfile.js
// -------------------------------------------------------
// Cloud Profile Management (Corrected for your schema)
// -------------------------------------------------------

import { supabase } from "./supabaseClient";

/**
 * 🔹 ensureSignedIn()
 * Silent authentication:
 * - Checks existing session
 * - Creates hidden account on first launch
 */
export async function ensureSignedIn() {
  // Check for existing session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user) {
    return session.user;
  }

  // Create hidden account
  const {
    data: { user },
    error,
  } = await supabase.auth.signUp({
    email: `hidden_${crypto.randomUUID()}@hidden.local`,
    password: crypto.randomUUID(),
  });

  if (error) {
    console.error("Silent signup failed:", error);
    return null;
  }

  return user;
}

/**
 * 🔹 ensureProfile(userId, deviceId)
 * Creates the profile row if missing.
 * Uses correct schema with all required columns.
 */
export async function ensureProfile(userId, deviceId = null) {
  console.debug("ensureProfile called", { userId, deviceId });
  
  if (!userId) {
    console.debug("ensureProfile: No userId provided, skipping");
    return null;
  }

  // Check if profile exists
  const { data: existing, error: selectErr } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("user_id", userId)
    .single();

  if (existing) {
    console.debug("Profile exists", { user_id: existing.user_id });
    return existing;
  }

  // Profile doesn't exist - insert with correct schema
  // Columns: user_id, device_id, username, avatar, premium, premium_family_id,
  // xp, coins, streak, last_streak_date, shield_count, created_at, updated_at,
  // handle, streak_shields, last_daily_quest
  const now = new Date().toISOString();
  
  const { error: insertErr } = await supabase.from("profiles").insert({
    user_id: userId,
    device_id: deviceId || null,
    username: null,
    avatar: null,
    handle: null,
    premium: false,
    premium_family_id: null,
    xp: 0,
    coins: 0,
    streak: 0,
    last_streak_date: null,
    shield_count: 0,
    streak_shields: 0,
    last_daily_quest: null,
    created_at: now,
    updated_at: now,
  });

  if (insertErr) {
    console.error("Profile creation failed:", insertErr);
    return null;
  }

  console.debug("Profile inserted", { user_id: userId });
  return { user_id: userId };
}

/**
 * 🔹 loadCloudProfile(userId)
 * Returns the full profile row.
 */
export async function loadCloudProfile(userId) {
  if (!userId) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Failed to load cloud profile:", error);
    return null;
  }

  // Auto-patch missing fields (safety)
  const patch = {};

  if (data.handle === null) patch.handle = null; // user will set during onboarding
  if (data.username === null) patch.username = null;
  if (data.avatar === null) patch.avatar = null;
  if (data.device_id === null) patch.device_id = null;

  if (Object.keys(patch).length > 0) {
    await saveCloudProfile(userId, patch);
    return { ...data, ...patch };
  }

  return data;
}

/**
 * 🔹 saveCloudProfile(userId, partialData)
 * Updates profile fields after onboarding or app usage.
 */
export async function saveCloudProfile(userId, partialData) {
  if (!userId) return;

  const { error } = await supabase
    .from("profiles")
    .update({ ...partialData, updated_at: new Date().toISOString() })
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to save cloud profile:", error);
  }
}
