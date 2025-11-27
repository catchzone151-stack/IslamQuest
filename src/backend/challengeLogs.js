import { supabase } from "../supabaseClient";

export async function logChallengeRequest(userId, opponentId, challengeId) {
  await supabase.from("challenge_requests").insert({
    user_id: userId,
    opponent_id: opponentId,
    challenge_id: challengeId,
    timestamp: Date.now(),
  });
}

export async function logChallengeResult(userId, opponentId, challengeId, result, xpGained) {
  await supabase.from("challenge_results").insert({
    user_id: userId,
    opponent_id: opponentId,
    challenge_id: challengeId,
    result,        // "win", "lose", "draw"
    xp_gained: xpGained,
    timestamp: Date.now(),
  });
}
