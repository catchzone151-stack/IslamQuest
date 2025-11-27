import { supabase } from "../supabaseClient";

export async function logStreakEvent(userId, type, value = null) {
  console.log("[StreakLogs] logStreakEvent:", userId, type, value);
}
