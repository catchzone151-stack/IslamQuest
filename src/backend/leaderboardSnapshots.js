import { supabase } from "../supabaseClient";

export async function createDailyLeaderboardSnapshot() {
  const now = Date.now();

  // Fetch global leaderboard
  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, xp, streak, username, avatar");

  // Fetch event entries
  const { data: events } = await supabase
    .from("event_entries")
    .select("*");

  await supabase.from("leaderboard_snapshots").insert({
    timestamp: now,
    global_leaderboard: profiles || [],
    event_leaderboard: events || [],
    streak_leaderboard: profiles
      ? profiles.sort((a, b) => b.streak - a.streak).map(p => ({
          user_id: p.user_id,
          streak: p.streak,
          username: p.username,
        }))
      : [],
  });
}
