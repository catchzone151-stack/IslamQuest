import { supabase } from "../supabaseClient";

export async function logXpEvent(userId, amount, source) {
  await supabase.from("xp_logs").insert({
    user_id: userId,
    amount,
    source,            // "lesson", "quiz", "daily_quest", "challenge", "streak_bonus", etc.
    timestamp: Date.now(),
  });
}
