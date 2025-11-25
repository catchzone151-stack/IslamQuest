// src/lib/userProfile.js
// -------------------------------------------------------
// Cloud Profile Management - Identity Pipeline
// -------------------------------------------------------
// ARCHITECTURE (Nov 2025):
// - Profiles are ONLY created after onboarding via createProfileAfterOnboarding()
// - NO profile creation at app startup
// - Avatar stored as INTEGER (index) in DB, string key in app
// - saveCloudProfile() only updates existing profiles, never inserts

import { supabase } from "./supabaseClient";
import { avatarKeyToIndex, avatarIndexToKey } from "../utils/avatarUtils";

// Default avatar for new profiles (index 0 = avatar_man_lantern)
const DEFAULT_AVATAR_KEY = "avatar_man_lantern";
const DEFAULT_AVATAR_INDEX = 0;

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
 * 🔹 checkProfileExists(userId)
 * Returns the profile if it exists, null if not.
 * Does NOT create a profile - use createProfileAfterOnboarding() for that.
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
 * 🔹 createProfileAfterOnboarding({ userId, deviceId, username, avatar, handle })
 * Creates a new profile with ALL required fields.
 * Called ONLY from completeOnboarding() after user finishes onboarding.
 * NO null fields allowed - all fields must be populated.
 */
export async function createProfileAfterOnboarding({ userId, deviceId, username, avatar, handle }) {
  if (!userId) {
    console.error("createProfileAfterOnboarding: Missing userId");
    return { success: false, error: "Missing userId" };
  }

  if (!username || !handle) {
    console.error("createProfileAfterOnboarding: Missing required fields", { username, handle });
    return { success: false, error: "Missing required fields (username or handle)" };
  }

  // Convert avatar string key to integer index for DB
  let avatarIndex = DEFAULT_AVATAR_INDEX;
  if (avatar) {
    if (typeof avatar === "string") {
      avatarIndex = avatarKeyToIndex(avatar) ?? DEFAULT_AVATAR_INDEX;
    } else if (typeof avatar === "number") {
      avatarIndex = avatar;
    }
  }

  const newProfileData = {
    user_id: userId,
    device_id: deviceId || null,
    username: username.trim(),
    handle: handle.trim().toLowerCase(),
    avatar: avatarIndex,
    xp: 0,
    coins: 0,
    streak: 0,
    shield_count: 0,
    created_at: new Date().toISOString(),
  };

  console.log("CREATING PROFILE →", userId, { username, handle, avatar: avatarIndex });

  const { data: insertedProfile, error: insertError } = await supabase
    .from("profiles")
    .insert(newProfileData)
    .select("user_id, username, handle, avatar, xp, coins, streak")
    .maybeSingle();

  if (insertError) {
    // Duplicate key = profile already exists (race condition or re-onboarding)
    if (insertError.code === "23505") {
      console.log("createProfileAfterOnboarding: Profile already exists, updating instead");
      // Update the existing profile instead
      return await saveCloudProfile(userId, { username, avatar, handle });
    }
    console.error("createProfileAfterOnboarding: insert error", insertError);
    return { success: false, error: insertError };
  }

  // Normalize avatar back to string key for app use
  if (insertedProfile && typeof insertedProfile.avatar === "number") {
    insertedProfile.avatar = avatarIndexToKey(insertedProfile.avatar);
  }

  console.log("PROFILE CREATED SUCCESSFULLY →", userId);
  return { success: true, data: insertedProfile };
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
 * NEVER inserts new profiles - use createProfileAfterOnboarding() for that.
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
      const idx = avatarKeyToIndex(partialData.avatar);
      if (idx !== null) {
        dataToSave.avatar = idx;
      }
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
