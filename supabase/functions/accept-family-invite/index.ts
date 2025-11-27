import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const { inviteToken, userId } = await req.json();
    
    if (!inviteToken || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing inviteToken or userId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const { data: invite, error: inviteError } = await supabase
      .from("family_members")
      .select(`
        id,
        family_group_id,
        invited_email,
        accepted,
        family_groups (
          id,
          owner_id,
          max_members
        )
      `)
      .eq("invite_token", inviteToken)
      .maybeSingle();
    
    if (inviteError || !invite) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired invite token" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (invite.accepted) {
      return new Response(
        JSON.stringify({ error: "Invite already accepted" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const { data: acceptedCount } = await supabase
      .from("family_members")
      .select("id")
      .eq("family_group_id", invite.family_group_id)
      .eq("accepted", true);
    
    const maxMembers = invite.family_groups?.max_members || 5;
    if (acceptedCount && acceptedCount.length >= maxMembers) {
      return new Response(
        JSON.stringify({ error: "Family group is full" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const { error: updateError } = await supabase
      .from("family_members")
      .update({
        user_id: userId,
        accepted: true,
        accepted_at: new Date().toISOString()
      })
      .eq("id", invite.id);
    
    if (updateError) {
      console.error("Failed to accept invite:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to accept invite" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const { data: owner } = await supabase
      .from("users")
      .select("premium, plan_type")
      .eq("id", invite.family_groups?.owner_id)
      .maybeSingle();
    
    const isPremium = owner?.premium && owner?.plan_type === "family";
    
    if (isPremium) {
      await supabase
        .from("users")
        .upsert({
          id: userId,
          premium: true,
          plan_type: "family",
          updated_at: new Date().toISOString()
        }, { onConflict: "id" });
    }
    
    console.log(`[FamilyInvite] User ${userId} joined family group ${invite.family_group_id}`);
    
    return new Response(
      JSON.stringify({
        success: true,
        familyGroupId: invite.family_group_id,
        premium: isPremium,
        planType: isPremium ? "family" : null
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Accept invite error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
