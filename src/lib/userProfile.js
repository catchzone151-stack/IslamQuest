// src/lib/userProfile.js
// Full replacement — matches your REAL Supabase schema (profiles.user_id, slugs, full row load)

import { supabase } from "./supabaseClient";

// Utility: generate a safe random handle (lowercase, no spaces)
function generateHandle() {
  return `user_${Math.floor(Math.random() * 90000 + 10000)}`.toLowerCase();
}

/**
 * Fetches an existing profile OR creates a new one if none exists.
 *
 * @param {string} userId - Auth user UUID (supabase.auth.getUser())
 * @param {string} deviceId - Local fingerprint UUID
 */
export async function getOrCreateProfile(userId, deviceId) {
  // 1. Try to load profile
  const { data: profile, error: fetchError } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (profile) {
    return profile; // 🎉 Profile exists
  }

  // 2. If no profile → create one
  const newProfile = {
    user_id: userId,
    device_id: deviceId,
    username: null, // user may set this later
    handle: generateHandle(), // guaranteed lowercase + unique constraint applies
    avatar: "avatar1", // your system uses avatar slugs
    xp: 0,
    coins: 0,
    streak: 0,
    last_streak_date: null,
    shield_count: 0,
    premium: false,
    premium_family_id: null,
  };

  const { data, error: insertError } = await supabase
    .from("profiles")
    .insert([newProfile])
    .select()
    .single();

  if (insertError) {
    console.error("Profile insert error:", insertError);
    return null;
  }

  return data;
}

/**
 * Updates a user profile row safely.
 *
 * @param {string} userId - Auth user UUID
 * @param {object} updates - Partial updates
 */
export async function updateProfile(userId, updates) {
  // Lowercase usernames/handles
  const cleanedUpdates = { ...updates };

  if (cleanedUpdates.username) {
    cleanedUpdates.username = cleanedUpdates.username.toLowerCase();
  }
  if (cleanedUpdates.handle) {
    cleanedUpdates.handle = cleanedUpdates.handle.toLowerCase();
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(cleanedUpdates)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error("Profile update error:", error);
    return null;
  }

  return data;
}
