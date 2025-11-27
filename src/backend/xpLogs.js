import { supabase } from "../supabaseClient";

export async function logXpEvent(userId, amount, source) {
  console.log("[XpLogs] logXpEvent:", userId, amount, source);
}
