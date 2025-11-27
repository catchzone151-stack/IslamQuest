import { supabase } from "../supabaseClient";

export async function logXpEvent(userId, amount, source) {
  const { error } = await supabase.from("xp_logs").insert({
    user_id: userId,
    amount: amount,
    source: source,
    timestamp: Date.now(),
  });
  if (error) {
    console.error("[XpLogs] logXpEvent error:", error);
  } else {
    console.log("[XpLogs] logXpEvent success:", amount, source);
  }
}
