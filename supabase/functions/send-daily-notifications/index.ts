// supabase/functions/send-daily-notifications/index.ts
// Daily streak reminder notifications with STRICT spam prevention
// 
// RULES:
// - Only send to users with active streak (streak > 0)
// - Only send to users who have NOT opened the app today
// - Max 1 notification per user per day
// - Rotates between different message variants
// - NO generic "come back" messages

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Message variants for daily streak reminders (rotated randomly)
const STREAK_MESSAGES = [
  { heading: "Don't lose your streak! 🔥", body: "One lesson keeps your streak alive" },
  { heading: "Your streak is waiting! 🔥", body: "Complete a quick lesson to keep it going" },
  { heading: "Keep the fire burning! 🔥", body: "Your streak needs you today" },
  { heading: "Streak alert! 🔥", body: "A quick lesson protects your progress" },
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

    // Fetch push tokens with user progress data
    // Only select users who:
    // 1. Have a valid push token
    // 2. Have NOT been active today (last_active < today OR last_active is NULL)
    // 3. Have an active streak (streak > 0) from user_progress
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

    // Get user progress to check for active streaks
    const userIds = usersToNotify.map(u => u.user_id);
    const { data: progressData, error: progressError } = await supabase
      .from("user_progress")
      .select("user_id, streak")
      .in("user_id", userIds)
      .gt("streak", 0); // Only users with active streaks

    if (progressError) {
      console.error("Error fetching progress:", progressError);
      return new Response(`Error: ${progressError.message}`, { status: 500 });
    }

    // Create a set of user IDs with active streaks
    const usersWithStreaks = new Set((progressData || []).map(p => p.user_id));

    // Final filter: only users with active streaks
    const finalUsers = usersToNotify.filter(u => usersWithStreaks.has(u.user_id));

    if (finalUsers.length === 0) {
      return new Response(JSON.stringify({ 
        message: "No users with active streaks need notifications",
        checked: usersToNotify.length,
        with_streaks: usersWithStreaks.size
      }), { 
        headers: { "Content-Type": "application/json" },
        status: 200 
      });
    }

    let successCount = 0;
    let failCount = 0;
    const now = new Date().toISOString();

    for (const user of finalUsers) {
      try {
        // Select random message variant
        const msg = STREAK_MESSAGES[Math.floor(Math.random() * STREAK_MESSAGES.length)];

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
            // iOS-specific settings
            ios_badgeType: "Increase",
            ios_badgeCount: 1,
          }),
        });

        if (response.ok) {
          successCount++;
          // Update last_notification_sent timestamp
          await supabase
            .from("push_tokens")
            .update({ last_notification_sent: now })
            .eq("user_id", user.user_id)
            .eq("device_token", user.device_token);
        } else {
          failCount++;
          console.error(`Failed to send to ${user.device_token}:`, await response.text());
        }
      } catch (err) {
        failCount++;
        console.error(`Error sending to ${user.device_token}:`, err);
      }
    }

    return new Response(
      JSON.stringify({
        message: "Streak notifications processed",
        success: successCount,
        failed: failCount,
        total_eligible: finalUsers.length,
        skipped_no_streak: usersToNotify.length - finalUsers.length,
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
