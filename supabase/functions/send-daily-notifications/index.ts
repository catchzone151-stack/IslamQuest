// supabase/functions/send-daily-notifications/index.ts
// Daily notifications with STRICT spam prevention
// 
// RULES:
// - Max 1 notification per user per day (via profiles.last_notification_sent)
// - Only send to users who have NOT opened the app today (profiles.updated_at)
// - Rotates between different message variants
// - NO generic "come back" messages
//
// TWO GROUPS (mutually exclusive):
// 1. streak > 0 → "protect your streak" templates
// 2. streak = 0 OR NULL → "learning encouragement" templates

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Message variants for users with active streaks (streak > 0)
const STREAK_MESSAGES = [
  { heading: "Don't lose your streak! 🔥", body: "One lesson keeps your streak alive" },
  { heading: "Your streak is waiting! 🔥", body: "Complete a quick lesson to keep it going" },
  { heading: "Keep the fire burning! 🔥", body: "Your streak needs you today" },
  { heading: "Streak alert! 🔥", body: "A quick lesson protects your progress" },
];

// Message variants for users without streaks (streak = 0 or NULL)
// Gentle, motivational learning prompts - no explicit "start a streak" language
const LEARNING_MESSAGES = [
  { heading: "Ready to learn something new? ✨", body: "Just 10 minutes today can grow your knowledge." },
  { heading: "A moment to learn 📖", body: "Do you have a few minutes to discover something beneficial?" },
  { heading: "Your learning journey awaits 🌱", body: "Open a lesson and begin today." },
  { heading: "Let's learn together 🤍", body: "How about learning one of the beautiful Names of Allah today?" },
];

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const oneSignalAppId = Deno.env.get("ONESIGNAL_APP_ID");
    const oneSignalApiKey = Deno.env.get("ONESIGNAL_REST_API_KEY");

    if (!supabaseUrl || !serviceKey) {
      return new Response("Missing Supabase credentials", { status: 500 });
    }

    if (!oneSignalAppId || !oneSignalApiKey) {
      return new Response("Missing OneSignal credentials", { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // Get today's date at midnight (UTC) for comparison
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Fetch push tokens (only need user_id and device_token)
    const { data: tokenData, error: tokenError } = await supabase
      .from("push_tokens")
      .select("user_id, device_token, platform");

    if (tokenError) {
      console.error("Error fetching tokens:", tokenError);
      return new Response(`Error: ${tokenError.message}`, { status: 500 });
    }

    if (!tokenData || tokenData.length === 0) {
      return new Response(JSON.stringify({ 
        message: "No push tokens registered",
        reason: "No users have push tokens"
      }), { 
        headers: { "Content-Type": "application/json" },
        status: 200 
      });
    }

    // Get all unique user IDs from tokens
    const userIds = [...new Set(tokenData.map(t => t.user_id))];

    // Fetch profiles to check updated_at (last app open) and last_notification_sent
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("id, updated_at, last_notification_sent")
      .in("id", userIds);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      return new Response(`Error: ${profilesError.message}`, { status: 500 });
    }

    // Create maps for user profile data
    const profileMap = new Map<string, { updated_at: string | null; last_notification_sent: string | null }>();
    for (const p of profilesData || []) {
      profileMap.set(p.id, { 
        updated_at: p.updated_at, 
        last_notification_sent: p.last_notification_sent 
      });
    }

    // Filter tokens: exclude users who opened the app today OR already notified today
    const eligibleTokens = tokenData.filter(t => {
      const profile = profileMap.get(t.user_id);
      
      // Check if user opened the app today (via profiles.updated_at)
      if (profile?.updated_at) {
        const lastOpen = new Date(profile.updated_at);
        lastOpen.setUTCHours(0, 0, 0, 0);
        if (lastOpen >= today) return false; // User already opened app today
      }
      
      // Check if user already received notification today (via profiles.last_notification_sent)
      if (profile?.last_notification_sent) {
        const lastSent = new Date(profile.last_notification_sent);
        lastSent.setUTCHours(0, 0, 0, 0);
        if (lastSent >= today) return false; // Already notified today
      }
      
      return true; // Eligible for notification
    });

    if (eligibleTokens.length === 0) {
      return new Response(JSON.stringify({ 
        message: "No eligible users for notifications",
        reason: "All users either opened the app today or were already notified"
      }), { 
        headers: { "Content-Type": "application/json" },
        status: 200 
      });
    }

    // Get user progress for all eligible users to check streaks
    const eligibleUserIds = [...new Set(eligibleTokens.map(t => t.user_id))];
    const { data: progressData, error: progressError } = await supabase
      .from("user_progress")
      .select("user_id, streak")
      .in("user_id", eligibleUserIds);

    if (progressError) {
      console.error("Error fetching progress:", progressError);
      return new Response(`Error: ${progressError.message}`, { status: 500 });
    }

    // Create a map of user_id -> streak value
    const streakMap = new Map<string, number>();
    for (const p of progressData || []) {
      streakMap.set(p.user_id, p.streak || 0);
    }

    // Split users into two groups
    const usersWithStreak: typeof eligibleTokens = [];
    const usersWithoutStreak: typeof eligibleTokens = [];

    for (const token of eligibleTokens) {
      const streak = streakMap.get(token.user_id) || 0;
      if (streak > 0) {
        usersWithStreak.push(token);
      } else {
        usersWithoutStreak.push(token);
      }
    }

    let streakSuccess = 0;
    let streakFail = 0;
    let learningSuccess = 0;
    let learningFail = 0;
    const now = new Date().toISOString();

    // Helper function to send notification and update profiles.last_notification_sent
    const sendNotification = async (
      token: { user_id: string; device_token: string },
      msg: { heading: string; body: string }
    ): Promise<boolean> => {
      const response = await fetch("https://onesignal.com/api/v1/notifications", {
        method: "POST",
        headers: {
          "Authorization": `Basic ${oneSignalApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          app_id: oneSignalAppId,
          include_player_ids: [token.device_token],
          headings: { en: msg.heading },
          contents: { en: msg.body },
          ios_badgeType: "Increase",
          ios_badgeCount: 1,
        }),
      });

      if (response.ok) {
        // Update profiles.last_notification_sent (user-level, not token-level)
        await supabase
          .from("profiles")
          .update({ last_notification_sent: now })
          .eq("id", token.user_id);
        return true;
      } else {
        console.error(`Failed to send to ${token.device_token}:`, await response.text());
        return false;
      }
    };

    // Track which users we've already sent to (avoid duplicate sends for multi-device users)
    const notifiedUsers = new Set<string>();

    // Send streak protection notifications
    for (const token of usersWithStreak) {
      if (notifiedUsers.has(token.user_id)) continue; // Skip if already notified this user
      try {
        const msg = STREAK_MESSAGES[Math.floor(Math.random() * STREAK_MESSAGES.length)];
        const success = await sendNotification(token, msg);
        if (success) {
          streakSuccess++;
          notifiedUsers.add(token.user_id);
        } else {
          streakFail++;
        }
      } catch (err) {
        streakFail++;
        console.error(`Error sending streak notification to ${token.device_token}:`, err);
      }
    }

    // Send learning encouragement notifications
    for (const token of usersWithoutStreak) {
      if (notifiedUsers.has(token.user_id)) continue; // Skip if already notified this user
      try {
        const msg = LEARNING_MESSAGES[Math.floor(Math.random() * LEARNING_MESSAGES.length)];
        const success = await sendNotification(token, msg);
        if (success) {
          learningSuccess++;
          notifiedUsers.add(token.user_id);
        } else {
          learningFail++;
        }
      } catch (err) {
        learningFail++;
        console.error(`Error sending learning notification to ${token.device_token}:`, err);
      }
    }

    return new Response(
      JSON.stringify({
        message: "Daily notifications processed",
        streak_notifications: {
          success: streakSuccess,
          failed: streakFail,
        },
        learning_notifications: {
          success: learningSuccess,
          failed: learningFail,
        },
        total_users_notified: notifiedUsers.size,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err) {
    console.error("Function error:", err);
    return new Response(`Server error: ${err.message}`, { status: 500 });
  }
});
