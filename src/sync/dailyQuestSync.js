You are Senior Dev Mode.

Replace the entire file:

src/sync/dailyQuestSync.js

with this clean, schema-accurate version:

-------------------------------------------------------------
import { supabase } from "../lib/supabaseClient.js";
import { useDailyQuestStore } from "../store/dailyQuestStore.js";
import { useProgressStore } from "../store/progressStore.js";

// ------------------------------------------------------------
// PULL daily quest for current user
// ------------------------------------------------------------
export async function pullDailyQuestFromCloud() {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;

  if (!userId) return null;

  const { data, error } = await supabase
    .from("daily_quests")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.warn("[DailyQuestSync] Pull ERROR:", error);
    return null;
  }

  return data;
}

// ------------------------------------------------------------
// PULL streak shield (from profiles table, not streak_logs)
// ------------------------------------------------------------
export async function pullStreakShieldFromCloud() {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;

  if (!userId) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("shield_count, streak_shields")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.warn("[DailyQuestSync] PullShield ERROR:", error);
    return null;
  }

  return data;
}

// ------------------------------------------------------------
// PUSH daily quest — Cloud is source of truth
// Completed quests only need completed=true and reward_given
// ------------------------------------------------------------
export async function pushDailyQuestToCloud() {
  const store = useDailyQuestStore.getState();
  const quest = store.currentQuest;

  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;

  if (!userId || !quest) return;

  const payload = {
    user_id: userId,
    quest_date: quest.date,
    questions: quest.questions,
    completed: quest.completed,
    reward_given: quest.rewardGiven,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("daily_quests")
    .upsert(payload, { onConflict: "user_id,quest_date" });

  if (error) {
    console.warn("[DailyQuestSync] Push ERROR:", error);
  }
}

// ------------------------------------------------------------
// MERGE cloud → local (cloud is ALWAYS primary)
// ------------------------------------------------------------
export function mergeDailyQuest(cloud) {
  if (!cloud) return;

  const set = useDailyQuestStore.getState().setDailyQuestFromSync;

  set({
    date: cloud.quest_date,
    questions: cloud.questions,
    completed: cloud.completed,
    rewardGiven: cloud.reward_given,
  });
}

// ------------------------------------------------------------
// MERGE streak shield from profiles table
// ------------------------------------------------------------
export function mergeStreakShield(cloud) {
  if (!cloud) return;

  const set = useProgressStore.getState().setStreakShieldFromSync;

  set({
    shieldCount: cloud.shield_count,
    streakShields: cloud.streak_shields,
  });
}
-------------------------------------------------------------
