// src/lib/userProfile.js
// -------------------------------------------------------
// Cloud Profile Management (Corrected for your schema)
// -------------------------------------------------------

import { supabase } from "./supabaseClient";
import { avatarKeyToIndex, avatarIndexToKey } from "../utils/avatarUtils";

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
 */
export async function ensureProfile(userId, deviceId) {
  if (!userId) {
    console.warn("ensureProfile called without userId");
    return;
  }

  console.log("ensureProfile: checking profile for", userId);

  const { data: existing, error: selectErr } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("user_id", userId)
    .single();

  if (existing) {
    console.log("ensureProfile: existing profile found");
    return existing;
  }
  if (selectErr && selectErr.code !== "PGRST116") {
    console.warn("ensureProfile: select error", selectErr);
  }

  const { error: insertErr } = await supabase.from("profiles").insert({
    user_id: userId,
    device_id: deviceId || null,
    username: null,
    avatar: null,
    handle: null,
  });

  if (insertErr) {
    console.error("Profile creation failed:", insertErr);
    return null;
  }

  console.log("ensureProfile: profile inserted for", userId);
  return { user_id: userId };
}

/**
 * 🔹 loadCloudProfile(userId)
 * Returns the full profile row.
 * Converts avatar integer index to string key for app usage.
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

  // Convert avatar integer index to string key
  const result = { ...data };
  if (typeof data.avatar === "number") {
    const avatarKey = avatarIndexToKey(data.avatar);
    result.avatar = avatarKey;
    console.log("loadCloudProfile: Converting avatar index", data.avatar, "→", avatarKey);
  }

  return result;
}

/**
 * 🔹 saveCloudProfile(userId, partialData)
 * Updates profile fields after onboarding or app usage.
 * Converts avatar string key to integer index for Supabase storage.
 */
export async function saveCloudProfile(userId, partialData) {
  if (!userId) return;

  // Convert avatar string key to integer index for DB storage
  const dataToSave = { ...partialData, updated_at: new Date().toISOString() };
  if (partialData.avatar !== undefined) {
    const avatarIndex = avatarKeyToIndex(partialData.avatar);
    dataToSave.avatar = avatarIndex;
    console.log("saveCloudProfile: Converting avatar", partialData.avatar, "→ index", avatarIndex);
  }

  const { error } = await supabase
    .from("profiles")
    .update(dataToSave)
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to save cloud profile:", error);
  }
}
