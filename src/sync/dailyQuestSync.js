import { supabase } from "../lib/supabaseClient.js";
import { useDailyQuestStore } from "../store/dailyQuestStore.js";
import { useProgressStore } from "../store/progressStore.js";

// ------------------------------------------------------------
// Pull daily quest from cloud
// ------------------------------------------------------------
export async function pullDailyQuestFromCloud() {
  const { data, error } = await supabase
    .from("daily_quests")
    .select("*")
    .single();

  if (error) {
    console.log("[DailyQuestSync] pullDailyQuest ERROR:", error);
    return null;
  }

  return data;
}

// ------------------------------------------------------------
// Pull streak shield from cloud
// ------------------------------------------------------------
export async function pullStreakShieldFromCloud() {
  const { data, error } = await supabase
    .from("streak_shields")
    .select("*")
    .single();

  if (error) {
    console.log("[DailyQuestSync] pullShield ERROR:", error);
    return null;
  }

  return data;
}

// ------------------------------------------------------------
// Push daily quest (only after completion)
// ------------------------------------------------------------
export async function pushDailyQuestToCloud() {
  const store = useDailyQuestStore.getState();
  const localQuest = store.currentQuest;

  if (!localQuest) return;

  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  if (!userId) return;

  const payload = {
    user_id: userId,
    current_quest: localQuest.id,
    completed_at: localQuest.completedAt,
    xp_reward: localQuest.xpReward,
    streak_bonus: localQuest.streakBonus,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("daily_quests").upsert(payload);

  if (error) {
    console.log("[DailyQuestSync] push ERROR:", error);
    return;
  }
}

// ------------------------------------------------------------
// Merge cloud → local (CLOUD FIRST)
// ------------------------------------------------------------
export function mergeDailyQuest(cloud) {
  if (!cloud) return;

  const set = useDailyQuestStore.getState().setDailyQuestFromSync;
  set({
    id: cloud.current_quest,
    completedAt: cloud.completed_at,
    xpReward: cloud.xp_reward,
    streakBonus: cloud.streak_bonus,
  });
}

export function mergeStreakShield(cloud) {
  if (!cloud) return;

  const set = useProgressStore.getState().setStreakShieldFromSync;
  set({
    shieldCount: cloud.shield_count,
    lastUsed: cloud.last_used,
  });
}
