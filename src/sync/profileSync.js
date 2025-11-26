import { supabase } from "../lib/supabaseClient.js";
import { useUserStore } from "../store/userStore.js";

/*
  FIELDS WE SYNC:
    - xp
    - streak
    - last_streak_update
    - streak_shield
    - last_xp_gain
*/

// ------------------------------------------------------------
// Pull profile from cloud
// ------------------------------------------------------------
export async function pullProfileFromCloud() {
  console.log("[ProfileSync] pullProfileFromCloud()");

  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;

  if (!userId) {
    console.warn("[ProfileSync] No authenticated user");
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("xp, streak, last_streak_update, streak_shield, last_xp_gain")
    .eq("id", userId)
    .single();

  if (error) {
    console.warn("[ProfileSync] Pull ERROR:", error);
    return null;
  }

  return data;
}

// ------------------------------------------------------------
// Push local profile → cloud (UPSERT)
// ------------------------------------------------------------
export async function pushProfileToCloud() {
  console.log("[ProfileSync] pushProfileToCloud()");

  const { user, xp, streak, lastStreakUpdate, streakShield, lastXpGain } =
    useUserStore.getState();

  if (!user?.id) {
    console.warn("[ProfileSync] No user to push");
    return;
  }

  const payload = {
    id: user.id,
    xp,
    streak,
    last_streak_update: lastStreakUpdate,
    streak_shield: streakShield,
    last_xp_gain: lastXpGain,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("profiles").upsert(payload);

  if (error) {
    console.warn("[ProfileSync] Push ERROR:", error);
    return;
  }

  console.log("[ProfileSync] Push successful");
}

// ------------------------------------------------------------
// Merge cloud → local (local-first override)
// ------------------------------------------------------------
export function mergeProfileData(cloudData) {
  if (!cloudData) return;

  const store = useUserStore.getState();

  const local = {
    xp: store.xp,
    streak: store.streak,
    lastStreakUpdate: store.lastStreakUpdate,
    streakShield: store.streakShield,
    lastXpGain: store.lastXpGain,
  };

  // If cloud has more recent streak/xp data → pull it
  // Local-first rule: cloud only overrides when timestamp is newer
  const merged = { ...local };

  if (cloudData.last_streak_update && 
      (!local.lastStreakUpdate ||
        new Date(cloudData.last_streak_update) > new Date(local.lastStreakUpdate))) {
    merged.streak = cloudData.streak;
    merged.lastStreakUpdate = cloudData.last_streak_update;
    merged.streakShield = cloudData.streak_shield;
  }

  if (cloudData.last_xp_gain && 
      (!local.lastXpGain ||
        new Date(cloudData.last_xp_gain) > new Date(local.lastXpGain))) {
    merged.xp = cloudData.xp;
    merged.lastXpGain = cloudData.last_xp_gain;
  }

  // Apply merged state to store
  store.setProfileFromSync(merged);

  console.log("[ProfileSync] merge complete");
}
