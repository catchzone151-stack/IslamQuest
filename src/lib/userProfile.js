// src/lib/userProfile.js
// -----------------------------------------------------------
// IslamQuest — Supabase Profile Binding (Phase 3, Step 4)
// Creates or loads the user's profile row after silent login.
// -----------------------------------------------------------

import { supabase } from "./supabaseClient";

// -----------------------------------------------------------
// Ensure a profile row exists for this user
// -----------------------------------------------------------
export async function ensureUserProfile(uid) {
  if (!uid) return null;

  // 1) Check if profile exists
  const { data: existing, error: fetchError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", uid)
    .single();

  if (existing) {
    console.log("👤 Profile loaded:", existing);
    return existing;
  }

  // If it's a fetch error unrelated to "no rows"
  if (fetchError && fetchError.code !== "PGRST116") {
    console.error("❌ Could not load profile:", fetchError);
    return null;
  }

  // 2) Create new profile row with placeholders
  const { data: created, error: insertError } = await supabase
    .from("profiles")
    .insert([
      {
        id: uid,
        display_name: null, // You fill this during onboarding
        avatar: null,       // You fill this during onboarding
        handle: null,       // User sets this after nickname
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (insertError) {
    console.error("❌ Failed creating new profile:", insertError);
    return null;
  }

  console.log("🆕 New profile created:", created);
  return created;
}
