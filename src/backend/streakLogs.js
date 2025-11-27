import { supabase } from "../supabaseClient";

export async function logStreakEvent(userId, maintained = true) {
  const today = new Date().toISOString().split("T")[0];
  const { error } = await supabase.from("streak_logs").insert({
    user_id: userId,
    date: today,
    maintained: maintained,
    created_at: new Date().toISOString(),
  });
  if (error) {
    console.error("[StreakLogs] logStreakEvent error:", error);
  } else {
    console.log("[StreakLogs] logStreakEvent success:", today, maintained);
  }
}
