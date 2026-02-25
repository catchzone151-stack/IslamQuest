import { supabase } from "../lib/supabaseClient";

export async function logStreakEvent(userId, maintained = true) {
  const today = new Date().toISOString().split("T")[0];
  // Upsert: if a row already exists for this user+date, ignore — never insert twice
  const { error } = await supabase.from("streak_logs").upsert(
    {
      user_id: userId,
      date: today,
      maintained: maintained,
      created_at: new Date().toISOString(),
    },
    { onConflict: "user_id,date", ignoreDuplicates: true }
  );
  if (error) {
    console.error("[StreakLogs] logStreakEvent error:", error);
  } else {
    console.log("[StreakLogs] logStreakEvent success:", today, maintained);
  }
}
