// src/lib/userProfile.js
// -------------------------------------------------------
// Cloud Profile Management - Identity Pipeline
// -------------------------------------------------------
// ARCHITECTURE:
// - Profiles are created by the database trigger on auth.users insert
// - Frontend never inserts into profiles directly — only the trigger and
//   the create_profile_if_missing RPC (called post-email-confirmation) do so
// - Avatar stored as INTEGER (index) in DB, string key in app
// - saveCloudProfile() only updates existing profiles, never inserts

import { supabase } from "./supabaseClient";
import { avatarKeyToIndex, avatarIndexToKey } from "../utils/avatarUtils";

/**
 * 🔹 checkProfileExists(userId)
 * Returns the profile if it exists, null if not.
 * Does NOT create a profile - profile creation is handled by the DB trigger.
 */
export async function checkProfileExists(userId) {
  if (!userId) {
    console.warn("checkProfileExists called without userId");
    return null;
  }

  const { data: existingProfile, error: selectError } = await supabase
    .from("profiles")
    .select("user_id, username, handle, avatar, xp, coins, streak")
    .eq("user_id", userId)
    .maybeSingle();

  if (selectError && selectError.code !== "PGRST116") {
    console.error("checkProfileExists: select error", selectError);
    return null;
  }

  if (existingProfile) {
    // Normalize avatar: convert integer to string if needed
    if (typeof existingProfile.avatar === "number") {
      existingProfile.avatar = avatarIndexToKey(existingProfile.avatar);
    }
    console.log("PROFILE EXISTS →", existingProfile.user_id);
    return existingProfile;
  }

  console.log("NO PROFILE FOUND for user →", userId);
  return null;
}

/**
 * 🔹 loadCloudProfile(userId)
 * Returns the full profile row.
 * Normalizes avatar to string key if stored as integer.
 */
export async function loadCloudProfile(userId) {
  if (!userId) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  // Normalize avatar: convert integer to string if needed
  const result = { ...data };
  if (typeof data.avatar === "number") {
    result.avatar = avatarIndexToKey(data.avatar);
  }

  return result;
}

/**
 * 🔹 saveCloudProfile(userId, partialData)
 * Updates ONLY identity fields (username, avatar, handle) on EXISTING profiles.
 * NEVER sends null/undefined values - only truthy fields are sent.
 * NEVER inserts new profiles - profile creation is handled by the DB trigger.
 * Avatar can be string key or integer index (converted to integer for DB).
 */
export async function saveCloudProfile(userId, partialData) {
  if (!userId) {
    console.warn("saveCloudProfile: No userId provided");
    return { success: false, error: "No userId" };
  }

  // Build payload with ONLY non-null identity fields
  const dataToSave = { updated_at: new Date().toISOString() };

  // Only include username if it's a non-empty string
  if (partialData.username && typeof partialData.username === "string" && partialData.username.trim()) {
    dataToSave.username = partialData.username.trim();
  }

  // Only include handle if it's a non-empty string
  if (partialData.handle && typeof partialData.handle === "string" && partialData.handle.trim()) {
    dataToSave.handle = partialData.handle.trim().toLowerCase();
  }

  // Only include avatar if it's set - convert string key to integer index
  if (partialData.avatar) {
    if (typeof partialData.avatar === "string") {
      dataToSave.avatar = avatarKeyToIndex(partialData.avatar);
    } else if (typeof partialData.avatar === "number") {
      dataToSave.avatar = partialData.avatar;
    }
  }

  // Don't send empty payload
  if (Object.keys(dataToSave).length <= 1) {
    console.warn("saveCloudProfile: No valid fields to update");
    return { success: false, error: "No valid fields" };
  }

  console.log("PROFILE UPDATE →", userId, dataToSave);

  const { data, error } = await supabase
    .from("profiles")
    .update(dataToSave)
    .eq("user_id", userId)
    .select();

  if (error) {
    console.error("saveCloudProfile: Update FAILED:", error);
    if (error.code === "23505" && error.message?.includes("handle")) {
      return { success: false, error: "handle_taken" };
    }
    return { success: false, error };
  }

  if (!data || data.length === 0) {
    console.warn("saveCloudProfile: No rows updated (profile may not exist)");
    return { success: false, error: "No rows updated" };
  }

  // Normalize avatar back to string key
  const result = { ...data[0] };
  if (typeof result.avatar === "number") {
    result.avatar = avatarIndexToKey(result.avatar);
  }

  return { success: true, data: result };
}

/**
 * 🔹 isProfileComplete(profile)
 * Returns true if profile has all required identity fields.
 * Used to determine if onboarding is needed.
 */
export function isProfileComplete(profile) {
  if (!profile) return false;
  
  // Must have username (not the temp "UserXXXX" pattern) and handle
  const hasValidUsername = profile.username && 
    typeof profile.username === "string" && 
    !profile.username.match(/^User\d{4}$/);
  
  const hasHandle = profile.handle && 
    typeof profile.handle === "string" && 
    profile.handle.trim().length > 0;
  
  return hasValidUsername && hasHandle;
}
