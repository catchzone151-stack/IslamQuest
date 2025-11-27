import { supabase } from "../supabaseClient";

export async function logXpEvent(userId, amount, source) {
  const { error } = await supabase.from("xp_logs").insert({
    user_id: userId,
    xp: amount,
    source,
    created_at: new Date().toISOString(),
  });
  if (error) {
    console.error("[XpLogs] logXpEvent error:", error);
  } else {
    console.log("[XpLogs] logXpEvent success:", amount, source);
  }
}
