import { supabase } from "../lib/supabaseClient.js";
import { useDailyQuestStore } from "../store/dailyQuestStore.js";

const getToday = () => new Date().toISOString().split("T")[0];

export async function pullDailyQuestFromCloud() {
  try {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return null;

    const { data, error } = await supabase
      .from("daily_quests")
      .select("*")
      .eq("user_id", auth.user.id)
      .maybeSingle();

    if (error) {
      console.warn("[DailyQuestSync] Pull ERROR:", error);
      return null;
    }

    return data;
  } catch (e) {
    console.warn("[DailyQuestSync] Pull exception:", e.message);
    return null;
  }
}

export async function pushDailyQuestToCloud(retry = true) {
  try {
    const store = useDailyQuestStore.getState();
    const { date, questions, completed, rewardGiven } = store;

    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return;

    const questDate = date || getToday();
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

    if (error) {
      console.warn("[DailyQuestSync] Push ERROR:", error);
      if (retry) {
        console.log("[DailyQuestSync] Retrying push...");
        await pushDailyQuestToCloud(false);
      }
    }
  } catch (e) {
    console.warn("[DailyQuestSync] Push exception:", e.message);
    if (retry) {
      try {
        await pushDailyQuestToCloud(false);
      } catch (retryErr) {
        console.warn("[DailyQuestSync] Retry failed:", retryErr.message);
      }
    }
  }
}

export function mergeDailyQuest(cloud) {
  if (!cloud) return;

  try {
    let questions = [];
    if (cloud.questions) {
      if (typeof cloud.questions === "string") {
        try {
          questions = JSON.parse(cloud.questions);
        } catch (e) {
          console.warn("[DailyQuestSync] Failed to parse questions JSON");
          questions = [];
        }
      } else if (Array.isArray(cloud.questions)) {
        questions = cloud.questions;
      }
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      console.warn("[DailyQuestSync] Invalid/empty questions, skipping merge");
      return;
    }

    const store = useDailyQuestStore.getState();
    if (store.setDailyQuestFromSync) {
      store.setDailyQuestFromSync({
        quest_date: cloud.quest_date || getToday(),
        questions: JSON.stringify(questions),
        completed: cloud.completed || false,
        reward_given: cloud.reward_given || false,
      });
    }
  } catch (e) {
    console.warn("[DailyQuestSync] mergeDailyQuest exception:", e.message);
  }
}

export async function pullStreakShieldFromCloud() {
  return null;
}

export function mergeStreakShield() {
  return;
}
