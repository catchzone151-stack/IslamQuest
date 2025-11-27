import { supabase } from "../supabaseClient";

export async function logStreakEvent(userId, type, value = null) {
  await supabase.from("streak_logs").insert({
    user_id: userId,
    event_type: type,         // "increment", "break", "shield_used", "shield_saved", "daily_xp"
    value,
    timestamp: Date.now(),
  });
}
