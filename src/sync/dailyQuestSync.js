import { supabase } from "../lib/supabaseClient.js";
import { useDailyQuestStore } from "../store/dailyQuestStore.js";
import { useProgressStore } from "../store/progressStore.js";

const getToday = () => new Date().toISOString().split("T")[0];

// ------------------------------------------------------------
// Pull daily quest
// ------------------------------------------------------------
export async function pullDailyQuestFromCloud() {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return null;

  const { data, error } = await supabase
    .from("daily_quests")
    .select("*")
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (error) {
    console.log("[DailyQuestSync] Pull ERROR:", error);
    return null;
  }

  return data;
}

// ------------------------------------------------------------
// Push daily quest
// ------------------------------------------------------------
export async function pushDailyQuestToCloud() {
  const store = useDailyQuestStore.getState();
  const { date, questions, completed, rewardGiven } = store;

  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return;

  // Make sure date is ALWAYS valid
  const questDate = date || getToday();

  const payload = {
    user_id: auth.user.id,
    quest_date: questDate,
    questions: JSON.stringify(questions || []),
    completed: completed || false,
    reward_given: rewardGiven || false,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("daily_quests")
    .upsert(payload, { onConflict: "user_id" });

  if (error) console.log("[DailyQuestSync] Push ERROR:", error);
}

// ------------------------------------------------------------
// Merge from cloud (CLOUD FIRST)
// ------------------------------------------------------------
export function mergeDailyQuest(cloud) {
  if (!cloud) return;

  const setDaily = useDailyQuestStore.getState().setDailyQuestFromSync;
  setDaily(cloud);
}

// ------------------------------------------------------------
// Streak shield lives in profiles table, so handled by profileSync
// ------------------------------------------------------------
export async function pullStreakShieldFromCloud() {
  return null;
}

export function mergeStreakShield() {
  return;
}
