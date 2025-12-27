// supabase/functions/send-challenge-notification/index.ts
// Challenge notifications - triggered when challenges are sent or accepted
//
// RULES:
// - Only send for challenge_received and challenge_accepted events
// - NO reminders or follow-ups
// - NO spam - one notification per event

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface ChallengeNotificationRequest {
  type: "challenge_received" | "challenge_accepted";
  target_user_id: string; // User to receive the notification
  sender_name: string;    // Name of the person who sent/accepted
  challenge_type: string; // Mode name (e.g., "Mind Battle")
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

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

    // Parse request body
    const body: ChallengeNotificationRequest = await req.json();
    const { type, target_user_id, sender_name, challenge_type } = body;

    // Validate required fields
    if (!type || !target_user_id || !sender_name) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: type, target_user_id, sender_name" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Only allow specific notification types (no spam)
    if (type !== "challenge_received" && type !== "challenge_accepted") {
      return new Response(
        JSON.stringify({ error: "Invalid notification type. Only challenge_received and challenge_accepted allowed." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // Get target user's push token
    const { data: tokenData, error: tokenError } = await supabase
      .from("push_tokens")
      .select("device_token, platform")
      .eq("user_id", target_user_id)
      .limit(1)
      .single();

    if (tokenError || !tokenData) {
      return new Response(
        JSON.stringify({ 
          message: "User has no push token registered",
          user_id: target_user_id
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Build notification message based on type
    let heading: string;
    let content: string;

    if (type === "challenge_received") {
      heading = "New Challenge! ⚔️";
      content = `${sender_name} challenged you to ${challenge_type || "a quiz battle"}!`;
    } else {
      // challenge_accepted
      heading = "Challenge Accepted! 🎮";
      content = `${sender_name} accepted your ${challenge_type || "challenge"}!`;
    }

    // Send notification via OneSignal
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${oneSignalApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        app_id: oneSignalAppId,
        include_player_ids: [tokenData.device_token],
        headings: { en: heading },
        contents: { en: content },
        // iOS-specific settings
        ios_badgeType: "Increase",
        ios_badgeCount: 1,
        // Deep link to challenges page
        data: { 
          type: type,
          navigate_to: "/challenge"
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OneSignal error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to send notification", details: errorText }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const result = await response.json();

    return new Response(
      JSON.stringify({
        success: true,
        message: `${type} notification sent`,
        recipient: target_user_id,
        onesignal_id: result.id,
      }),
      {
        status: 200,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (err) {
    console.error("Function error:", err);
    return new Response(
      JSON.stringify({ error: `Server error: ${err.message}` }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
