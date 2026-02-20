import { supabase } from "../lib/supabaseClient.js";
import { useProgressStore } from "../store/progressStore.js";

const DEFAULT_PROFILE = {
  xp: 0,
  coins: 0,
  streak: 0,
  shield_count: 0,
};

export async function pullProfileFromCloud() {
  try {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    if (!userId) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("xp, coins, streak, shield_count, premium, last_completed_activity_date, updated_at")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      if (error.code !== "PGRST116") {
        console.warn("[ProfileSync] Pull error:", error.message);
      }
      return null;
    }

    return data;
  } catch (e) {
    console.warn("[ProfileSync] Pull exception:", e.message);
    return null;
  }
}

export async function pushProfileToCloud(retry = true) {
  try {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    if (!userId) return;

    const progressState = useProgressStore.getState();
    const payload = progressState.serializeForSupabase();

    if (!payload || Object.keys(payload).length === 0) return;

    const { error } = await supabase
      .from("profiles")
      .update(payload)
      .eq("user_id", userId);

    if (error) {
      if (error.code !== "PGRST116") {
        console.warn("[ProfileSync] Push error:", error.message);
      }
      if (retry) {
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

  const store = useProgressStore.getState();
  const localTs = store.getLastUpdatedAt();
  const cloudTs = cloud.updated_at ? new Date(cloud.updated_at).getTime() : 0;

  if (cloudTs > localTs) {
    store.setFromCloudSync({
      xp: cloud.xp ?? DEFAULT_PROFILE.xp,
      coins: cloud.coins ?? DEFAULT_PROFILE.coins,
      streak: cloud.streak ?? DEFAULT_PROFILE.streak,
      shieldCount: cloud.shield_count ?? DEFAULT_PROFILE.shield_count,
      premium: cloud.premium ?? false,
      last_completed_activity_date: cloud.last_completed_activity_date ?? null,
    }, cloud.updated_at);
  }
}
