import { supabase } from "../supabaseClient";

export async function logChallengeRequest(userId, mode, opponentId = null) {
  const { error } = await supabase.from("challenge_logs").insert({
    user_id: userId,
    event_type: "request",
    challenge_mode: mode,
    opponent_id: opponentId,
    timestamp: Date.now(),
  });
  if (error) {
    console.error("[ChallengeLogs] logChallengeRequest error:", error);
  } else {
    console.log("[ChallengeLogs] logChallengeRequest success:", mode);
  }
}

export async function logChallengeResult(userId, mode, result, xpEarned, opponentId = null) {
  const { error } = await supabase.from("challenge_logs").insert({
    user_id: userId,
    event_type: "result",
    challenge_mode: mode,
    opponent_id: opponentId,
    result,
    xp_earned: xpEarned,
    timestamp: Date.now(),
  });
  if (error) {
    console.error("[ChallengeLogs] logChallengeResult error:", error);
  } else {
    console.log("[ChallengeLogs] logChallengeResult success:", mode, result, xpEarned);
  }
}
