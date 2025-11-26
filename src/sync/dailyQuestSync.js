import { supabase } from "../lib/supabaseClient.js";
import { useDailyQuestStore } from "../store/dailyQuestStore.js";

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

  const questDate = date || getToday();

  // --- SAFE JSON ---
  const safeQuestions = Array.isArray(questions) ? questions : [];

  const payload = {
    user_id: auth.user.id,
    quest_date: questDate,
    questions: JSON.stringify(safeQuestions),
    completed: Boolean(completed),
    reward_given: Boolean(rewardGiven),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("daily_quests")
    .upsert(payload, { onConflict: "user_id" });

  if (error) console.log("[DailyQuestSync] Push ERROR:", error);
}

// ------------------------------------------------------------
// Merge cloud → local
// ------------------------------------------------------------
export function mergeDailyQuest(cloud) {
  if (!cloud) return;
  useDailyQuestStore.getState().setDailyQuestFromSync(cloud);
}

// ------------------------------------------------------------
// Shield handled by profileSync, skip here
// ------------------------------------------------------------
export async function pullStreakShieldFromCloud() {
  return null;
}

export function mergeStreakShield() {
  return;
}
