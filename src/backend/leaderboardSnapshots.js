import { supabase } from "../supabaseClient";

export async function createDailyLeaderboardSnapshot() {
  const today = new Date().toISOString().split("T")[0];

  // Fetch global leaderboard
  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, xp, streak, username, avatar")
    .order("xp", { ascending: false })
    .limit(100);

  // Fetch event entries
  const { data: events } = await supabase
    .from("event_entries")
    .select("*");

  // Insert global leaderboard
  const { error: globalErr } = await supabase.from("leaderboard_snapshots").upsert({
    snapshot_date: today,
    leaderboard_type: "global",
    data: profiles || [],
  }, { onConflict: "snapshot_date,leaderboard_type" });

  if (globalErr) {
    console.error("[LeaderboardSnapshots] global snapshot error:", globalErr);
  }

  // Insert event leaderboard
  const { error: eventErr } = await supabase.from("leaderboard_snapshots").upsert({
    snapshot_date: today,
    leaderboard_type: "event",
    data: events || [],
  }, { onConflict: "snapshot_date,leaderboard_type" });

  if (eventErr) {
    console.error("[LeaderboardSnapshots] event snapshot error:", eventErr);
  }

  // Insert streak leaderboard
  const streakData = profiles
    ? [...profiles].sort((a, b) => (b.streak || 0) - (a.streak || 0)).slice(0, 50)
    : [];

  const { error: streakErr } = await supabase.from("leaderboard_snapshots").upsert({
    snapshot_date: today,
    leaderboard_type: "streak",
    data: streakData,
  }, { onConflict: "snapshot_date,leaderboard_type" });

  if (streakErr) {
    console.error("[LeaderboardSnapshots] streak snapshot error:", streakErr);
  } else {
    console.log("[LeaderboardSnapshots] Daily snapshot created for", today);
  }
}
