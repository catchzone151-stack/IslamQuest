import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    const { data: tokens, error } = await supabase
      .from("push_tokens")
      .select("*");

    if (error) {
      console.error("Error fetching tokens:", error);
      return new Response(`Error: ${error.message}`, { status: 500 });
    }

    if (!tokens || tokens.length === 0) {
      return new Response("No tokens found", { status: 200 });
    }

    let successCount = 0;
    let failCount = 0;

    for (const t of tokens) {
      try {
        const response = await fetch("https://onesignal.com/api/v1/notifications", {
          method: "POST",
          headers: {
            "Authorization": `Basic ${oneSignalApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            app_id: oneSignalAppId,
            include_player_ids: [t.device_token],
            headings: { en: "Don't lose your streak! 🔥" },
            contents: { en: "Come back and complete today's Daily Quest." },
          }),
        });

        if (response.ok) {
          successCount++;
        } else {
          failCount++;
          console.error(`Failed to send to ${t.device_token}:`, await response.text());
        }
      } catch (err) {
        failCount++;
        console.error(`Error sending to ${t.device_token}:`, err);
      }
    }

    return new Response(
      JSON.stringify({
        message: "Notifications processed",
        success: successCount,
        failed: failCount,
        total: tokens.length,
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
