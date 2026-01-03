// supabase/functions/send-daily-notifications/index.ts
// Daily notifications with STRICT spam prevention
// 
// RULES:
// - Max 1 notification per user per day
// - Only send to users who have NOT opened the app today
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
    const todayStr = today.toISOString();

    // Fetch push tokens for users who:
    // 1. Have a valid push token
    // 2. Have NOT been active today (last_active < today OR last_active is NULL)
    const { data: eligibleUsers, error: fetchError } = await supabase
      .from("push_tokens")
      .select(`
        user_id,
        device_token,
        platform,
        last_active,
        last_notification_sent
      `)
      .or(`last_active.is.null,last_active.lt.${todayStr}`);

    if (fetchError) {
      console.error("Error fetching tokens:", fetchError);
      return new Response(`Error: ${fetchError.message}`, { status: 500 });
    }

    if (!eligibleUsers || eligibleUsers.length === 0) {
      return new Response(JSON.stringify({ 
        message: "No eligible users for notifications",
        reason: "All users either active today or no tokens registered"
      }), { 
        headers: { "Content-Type": "application/json" },
        status: 200 
      });
    }

    // Filter out users who already received a notification today
    const usersToNotify = eligibleUsers.filter(u => {
      if (!u.last_notification_sent) return true;
      const lastSent = new Date(u.last_notification_sent);
      lastSent.setUTCHours(0, 0, 0, 0);
      return lastSent < today;
    });

    if (usersToNotify.length === 0) {
      return new Response(JSON.stringify({ 
        message: "All eligible users already notified today",
        total_eligible: eligibleUsers.length
      }), { 
        headers: { "Content-Type": "application/json" },
        status: 200 
      });
    }

    // Get user progress for all users to check streaks
    const userIds = usersToNotify.map(u => u.user_id);
    const { data: progressData, error: progressError } = await supabase
      .from("user_progress")
      .select("user_id, streak")
      .in("user_id", userIds);

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
    const usersWithStreak: typeof usersToNotify = [];
    const usersWithoutStreak: typeof usersToNotify = [];

    for (const user of usersToNotify) {
      const streak = streakMap.get(user.user_id) || 0;
      if (streak > 0) {
        usersWithStreak.push(user);
      } else {
        usersWithoutStreak.push(user);
      }
    }

    let streakSuccess = 0;
    let streakFail = 0;
    let learningSuccess = 0;
    let learningFail = 0;
    const now = new Date().toISOString();

    // Helper function to send notification and update timestamp
    const sendNotification = async (
      user: { user_id: string; device_token: string },
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
          include_player_ids: [user.device_token],
          headings: { en: msg.heading },
          contents: { en: msg.body },
          ios_badgeType: "Increase",
          ios_badgeCount: 1,
        }),
      });

      if (response.ok) {
        await supabase
          .from("push_tokens")
          .update({ last_notification_sent: now })
          .eq("user_id", user.user_id)
          .eq("device_token", user.device_token);
        return true;
      } else {
        console.error(`Failed to send to ${user.device_token}:`, await response.text());
        return false;
      }
    };

    // Send streak protection notifications
    for (const user of usersWithStreak) {
      try {
        const msg = STREAK_MESSAGES[Math.floor(Math.random() * STREAK_MESSAGES.length)];
        const success = await sendNotification(user, msg);
        if (success) streakSuccess++;
        else streakFail++;
      } catch (err) {
        streakFail++;
        console.error(`Error sending streak notification to ${user.device_token}:`, err);
      }
    }

    // Send learning encouragement notifications
    for (const user of usersWithoutStreak) {
      try {
        const msg = LEARNING_MESSAGES[Math.floor(Math.random() * LEARNING_MESSAGES.length)];
        const success = await sendNotification(user, msg);
        if (success) learningSuccess++;
        else learningFail++;
      } catch (err) {
        learningFail++;
        console.error(`Error sending learning notification to ${user.device_token}:`, err);
      }
    }

    return new Response(
      JSON.stringify({
        message: "Daily notifications processed",
        streak_notifications: {
          success: streakSuccess,
          failed: streakFail,
          total: usersWithStreak.length,
        },
        learning_notifications: {
          success: learningSuccess,
          failed: learningFail,
          total: usersWithoutStreak.length,
        },
        total_processed: usersToNotify.length,
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
