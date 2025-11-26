import { supabase } from "../lib/supabaseClient.js";
import { useUserStore } from "../store/useUserStore.js";

/*
  REAL CLOUD FIELDS:
    xp
    streak
    last_streak_date
    shield_count
    streak_shields
*/

export async function pullProfileFromCloud() {
  console.log("[ProfileSync] pullProfileFromCloud()");

  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;

  if (!userId) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("xp, streak, last_streak_date, shield_count, streak_shields")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.warn("[ProfileSync] Pull ERROR:", error);
    return null;
  }

  return data;
}

export async function pushProfileToCloud() {
  console.log("[ProfileSync] pushProfileToCloud()");

  const store = useUserStore.getState();
  const { user, xp, streak, lastStreakDate, shieldCount, streakShields } = store;

  if (!user?.id) return;

  const payload = {
    user_id: user.id,
    xp,
    streak,
    last_streak_date: lastStreakDate,
    shield_count: shieldCount,
    streak_shields: streakShields,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("profiles")
    .upsert(payload, { onConflict: "user_id" });

  if (error) console.warn("[ProfileSync] Push ERROR:", error);
}

export function mergeProfileData(cloud) {
  if (!cloud) return;

  const set = useUserStore.getState().setProfileFromSync;

  set({
    xp: cloud.xp,
    streak: cloud.streak,
    lastStreakDate: cloud.last_streak_date,
    shieldCount: cloud.shield_count,
    streakShields: cloud.streak_shields,
  });
}