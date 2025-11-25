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
 * Creates the profile row if missing, with sensible defaults.
 * This is the ONLY function that should ever INSERT into the profiles table.
 * Uses SELECT-then-INSERT pattern to prevent duplicates and NULL values.
 */
export async function ensureProfile(userId, deviceId) {
  if (!userId) {
    console.warn("ensureProfile called without userId");
    return null;
  }

  console.log("ensureProfile: checking/creating profile for", userId);

  // Step 1: Check if profile already exists
  const { data: existingProfile, error: selectError } = await supabase
    .from("profiles")
    .select("user_id, username, avatar, xp, coins, streak")
    .eq("user_id", userId)
    .maybeSingle();

  console.log("ensureProfile: SELECT result - data:", existingProfile, "error:", selectError);

  if (selectError && selectError.code !== "PGRST116") {
    console.error("ensureProfile: select error", selectError);
    return null;
  }

  // Profile already exists - return it
  if (existingProfile) {
    console.log("PROFILE: existing →", existingProfile);
    console.log("ensureProfile: existing profile found (upsert skipped)");
    return existingProfile;
  }
  
  console.log("ensureProfile: No existing profile found, will create new one");

  // Step 2: Profile doesn't exist - create with ALL default values (no NULLs)
  console.log("PROFILE: creating new profile for device →", deviceId);
  
  // Generate random suffix for default username
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const defaultUsername = `User${randomSuffix}`;
  
  const newProfileData = {
    user_id: userId,
    device_id: deviceId || null,
    username: defaultUsername,       // Never NULL
    avatar: 0,                        // Default avatar index (avatar_man_pixel)
    xp: 0,                            // Never NULL
    coins: 0,                         // Never NULL
    streak: 0,                        // Never NULL
    shield_count: 0,                  // Never NULL
    handle: null,                     // Set during onboarding
    created_at: new Date().toISOString(),
  };

  const { data: insertedProfile, error: insertError } = await supabase
    .from("profiles")
    .insert(newProfileData)
    .select("user_id, username, avatar, xp, coins, streak")
    .maybeSingle();

  if (insertError) {
    // Duplicate key = race condition, profile was created by another request
    if (insertError.code === "23505") {
      console.log("ensureProfile: race condition detected, fetching existing profile");
      const { data: raceProfile } = await supabase
        .from("profiles")
        .select("user_id, username, avatar, xp, coins, streak")
        .eq("user_id", userId)
        .maybeSingle();
      return raceProfile || { user_id: userId };
    }
    console.error("ensureProfile: insert error", insertError);
    return null;
  }

  console.log("PROFILE: created →", insertedProfile);
  console.log("ensureProfile: profile ready for", userId);
  return insertedProfile || { user_id: userId };
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
    .maybeSingle();

  if (error || !data) {
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
  if (!userId) {
    console.warn("saveCloudProfile: No userId provided");
    return { success: false, error: "No userId" };
  }

  // Convert avatar string key to integer index for DB storage
  const dataToSave = { ...partialData, updated_at: new Date().toISOString() };
  if (partialData.avatar !== undefined) {
    const avatarIndex = avatarKeyToIndex(partialData.avatar);
    dataToSave.avatar = avatarIndex;
    console.log("saveCloudProfile: Converting avatar", partialData.avatar, "→ index", avatarIndex);
  }

  console.log("saveCloudProfile: Updating profile for", userId, "with data:", dataToSave);

  const { data, error, count } = await supabase
    .from("profiles")
    .update(dataToSave)
    .eq("user_id", userId)
    .select();

  if (error) {
    console.error("saveCloudProfile: Update FAILED:", error);
    return { success: false, error };
  }

  console.log("saveCloudProfile: Update result - rows affected:", data?.length || 0, "data:", data);
  
  if (!data || data.length === 0) {
    console.warn("saveCloudProfile: No rows updated - profile may not exist for user", userId);
    return { success: false, error: "No rows updated" };
  }

  return { success: true, data: data[0] };
}
