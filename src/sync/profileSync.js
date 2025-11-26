import { supabase } from "../lib/supabaseClient.js";
import { useUserStore } from "../store/useUserStore.js";

const DEFAULT_PROFILE = {
  xp: 0,
  streak: 0,
  last_streak_date: null,
  shield_count: 0,
  streak_shields: 0,
};

export async function pullProfileFromCloud() {
  console.log("[ProfileSync] pullProfileFromCloud()");

  try {
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
  } catch (e) {
    console.warn("[ProfileSync] Pull exception:", e.message);
    return null;
  }
}

export async function pushProfileToCloud(retry = true) {
  console.log("[ProfileSync] pushProfileToCloud()");

  try {
    const store = useUserStore.getState();
    const { user, xp, streak, lastStreakDate, shieldCount, streakShields } = store;

    if (!user?.id) return;

    const payload = {
      user_id: user.id,
      xp: xp ?? 0,
      streak: streak ?? 0,
      last_streak_date: lastStreakDate ?? null,
      shield_count: shieldCount ?? 0,
      streak_shields: streakShields ?? 0,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("profiles")
      .upsert(payload, { onConflict: "user_id" });

    if (error) {
      console.warn("[ProfileSync] Push ERROR:", error);
      if (retry) {
        console.log("[ProfileSync] Retrying push...");
        await pushProfileToCloud(false);
      }
    }
  } catch (e) {
    console.warn("[ProfileSync] Push exception:", e.message);
    if (retry) {
      try {
        await pushProfileToCloud(false);
      } catch (retryErr) {
        console.warn("[ProfileSync] Retry failed:", retryErr.message);
      }
    }
  }
}

export function mergeProfileData(cloud) {
  if (!cloud) return;

  const set = useUserStore.getState().setProfileFromSync;
  if (!set) return;

  set({
    xp: cloud.xp ?? DEFAULT_PROFILE.xp,
    streak: cloud.streak ?? DEFAULT_PROFILE.streak,
    lastStreakDate: cloud.last_streak_date ?? DEFAULT_PROFILE.last_streak_date,
    shieldCount: cloud.shield_count ?? DEFAULT_PROFILE.shield_count,
    streakShields: cloud.streak_shields ?? DEFAULT_PROFILE.streak_shields,
  });
}
