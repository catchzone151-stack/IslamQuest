import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    
    if (!RESEND_API_KEY) {
      console.error("[WelcomeEmail] Missing RESEND_API_KEY");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { email, username } = await req.json();

    if (!email || email.toLowerCase() !== user.email?.toLowerCase()) {
      return new Response(
        JSON.stringify({ error: "Email mismatch or not provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const displayName = username || "there";

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0f1e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <tr>
      <td style="text-align: center; padding-bottom: 30px;">
        <h1 style="color: #D4AF37; font-size: 28px; margin: 0;">
          &#127775; Islam Quest
        </h1>
      </td>
    </tr>
    <tr>
      <td style="background: linear-gradient(180deg, #0f1a2e 0%, #0a1220 100%); border-radius: 20px; padding: 40px 30px;">
        <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 20px; text-align: center;">
          Assalamu Alaikum, ${displayName}! &#128522;
        </h2>
        <p style="color: rgba(255,255,255,0.8); font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
          Welcome to <strong style="color: #D4AF37;">Islam Quest</strong> - your journey to Islamic knowledge starts now!
        </p>
        <p style="color: rgba(255,255,255,0.8); font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
          We're so excited to have you join our community of learners. Here's what awaits you:
        </p>
        <ul style="color: rgba(255,255,255,0.8); font-size: 15px; line-height: 1.8; padding-left: 20px; margin: 0 0 25px;">
          <li><strong style="color: #10b981;">14 Learning Paths</strong> - From basics to in-depth knowledge</li>
          <li><strong style="color: #10b981;">Daily Quests</strong> - Build your streak and earn rewards</li>
          <li><strong style="color: #10b981;">Friend Challenges</strong> - Learn together with friends</li>
          <li><strong style="color: #10b981;">Achievements</strong> - Track your progress and celebrate milestones</li>
        </ul>
        <p style="color: rgba(255,255,255,0.8); font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
          Start your first lesson today and take the first step on your path to knowledge!
        </p>
        <div style="text-align: center;">
          <p style="color: #D4AF37; font-size: 18px; font-weight: 600; margin: 0;">
            May Allah bless your journey &#128588;
          </p>
        </div>
      </td>
    </tr>
    <tr>
      <td style="text-align: center; padding-top: 30px;">
        <p style="color: rgba(255,255,255,0.5); font-size: 13px; margin: 0;">
          Islam Quest - Learn, Grow, Succeed
        </p>
        <p style="color: rgba(255,255,255,0.3); font-size: 12px; margin: 10px 0 0;">
          This email was sent because you created an account on Islam Quest.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Islam Quest <welcome@islamquest.app>",
        to: [email],
        subject: "Welcome to Islam Quest! Your Journey Begins 🌙",
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[WelcomeEmail] Resend API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: errorText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await response.json();
    console.log("[WelcomeEmail] Sent successfully to:", email);

    return new Response(
      JSON.stringify({ success: true, id: result.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[WelcomeEmail] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to send welcome email" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
