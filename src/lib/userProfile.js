// src/lib/userProfile.js
// -------------------------------------------------------
// Cloud Profile Management - Identity Pipeline (Fixed)
// -------------------------------------------------------
// Avatar stored as TEXT (string key), not integer
// Profile creation happens ONCE with full defaults
// Updates NEVER overwrite with null values

import { supabase } from "./supabaseClient";
import { avatarKeyToIndex, avatarIndexToKey } from "../utils/avatarUtils";

// Default avatar key for new profiles
const DEFAULT_AVATAR = "avatar_man_lantern";

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
 * Creates the profile row if missing, with sensible defaults.
 * This is the ONLY function that should ever INSERT into the profiles table.
 * Uses SELECT-then-INSERT pattern to prevent duplicates.
 * Avatar is stored as TEXT (string key), not integer.
 */
export async function ensureProfile(userId, deviceId) {
  if (!userId) {
    console.warn("ensureProfile called without userId");
    return null;
  }

  // Step 1: Check if profile already exists
  const { data: existingProfile, error: selectError } = await supabase
    .from("profiles")
    .select("user_id, username, handle, avatar, xp, coins, streak")
    .eq("user_id", userId)
    .maybeSingle();

  if (selectError && selectError.code !== "PGRST116") {
    console.error("ensureProfile: select error", selectError);
    return null;
  }

  // Profile already exists - return it (with avatar normalization)
  if (existingProfile) {
    // Normalize avatar: convert integer to string if needed
    if (typeof existingProfile.avatar === "number") {
      existingProfile.avatar = avatarIndexToKey(existingProfile.avatar);
    }
    console.log("PROFILE: existing →", existingProfile.user_id);
    return existingProfile;
  }

  // Step 2: Profile doesn't exist - create with ALL default values (no NULLs)
  console.log("PROFILE CREATED for device →", deviceId);
  
  // Generate random suffix for temporary username
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const tempUsername = `User${randomSuffix}`;
  
  // Insert with TEXT avatar (string key), not integer
  const newProfileData = {
    user_id: userId,
    device_id: deviceId || null,
    username: tempUsername,           // Temporary - replaced during onboarding
    avatar: DEFAULT_AVATAR,           // TEXT: string key, not integer
    xp: 0,
    coins: 0,
    streak: 0,
    shield_count: 0,
    handle: null,                     // Set during onboarding
    created_at: new Date().toISOString(),
  };

  const { data: insertedProfile, error: insertError } = await supabase
    .from("profiles")
    .insert(newProfileData)
    .select("user_id, username, handle, avatar, xp, coins, streak")
    .maybeSingle();

  if (insertError) {
    // Duplicate key = race condition, profile was created by another request
    if (insertError.code === "23505") {
      console.log("ensureProfile: race condition, fetching existing");
      const { data: raceProfile } = await supabase
        .from("profiles")
        .select("user_id, username, handle, avatar, xp, coins, streak")
        .eq("user_id", userId)
        .maybeSingle();
      if (raceProfile && typeof raceProfile.avatar === "number") {
        raceProfile.avatar = avatarIndexToKey(raceProfile.avatar);
      }
      return raceProfile || { user_id: userId };
    }
    console.error("ensureProfile: insert error", insertError);
    return null;
  }

  return insertedProfile || { user_id: userId };
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
 * Updates ONLY identity fields (username, avatar, handle).
 * NEVER sends null/undefined values - only truthy fields are sent.
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

  console.log("PROFILE UPDATED →", userId, dataToSave);

  const { data, error } = await supabase
    .from("profiles")
    .update(dataToSave)
    .eq("user_id", userId)
    .select();

  if (error) {
    console.error("saveCloudProfile: Update FAILED:", error);
    return { success: false, error };
  }

  if (!data || data.length === 0) {
    console.warn("saveCloudProfile: No rows updated");
    return { success: false, error: "No rows updated" };
  }

  return { success: true, data: data[0] };
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
  
  const hasAvatar = profile.avatar && profile.avatar !== DEFAULT_AVATAR;
  
  return hasValidUsername && hasHandle;
}
