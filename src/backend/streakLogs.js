import { supabase } from "../supabaseClient";

export async function logStreakEvent(userId, type, value = null) {
  const { error } = await supabase.from("streak_logs").insert({
    user_id: userId,
    event_type: type,
    streak_value: value,
    timestamp: Date.now(),
  });
  if (error) {
    console.error("[StreakLogs] logStreakEvent error:", error);
  } else {
    console.log("[StreakLogs] logStreakEvent success:", type, value);
  }
}
