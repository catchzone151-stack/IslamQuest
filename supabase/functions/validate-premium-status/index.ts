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
    
    const { userId, deviceId } = await req.json();
    
    if (!userId || !deviceId) {
      return new Response(
        JSON.stringify({ error: "Missing userId or deviceId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("premium, plan_type, active_device_id")
      .eq("id", userId)
      .maybeSingle();
    
    if (userError) {
      console.error("User fetch error:", userError);
      return new Response(
        JSON.stringify({ premium: false, error: "User not found" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!user) {
      return new Response(
        JSON.stringify({ premium: false, planType: null, deviceMatch: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (user.premium) {
      const deviceMatch = user.active_device_id === deviceId;
      
      if (!deviceMatch) {
        if (user.active_device_id) {
          console.log(`[ValidatePremium] Device mismatch for user ${userId}. Premium not granted on this device.`);
          return new Response(
            JSON.stringify({
              premium: false,
              requiresDeviceTransfer: true,
              planType: user.plan_type
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        const { error: updateError } = await supabase
          .from("users")
          .update({ 
            active_device_id: deviceId,
            updated_at: new Date().toISOString()
          })
          .eq("id", userId);
        
        if (updateError) {
          console.error("[ValidatePremium] Failed to set initial device:", updateError);
          return new Response(
            JSON.stringify({ premium: false, error: "Device setup failed" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        console.log(`[ValidatePremium] Initial device set for user ${userId}`);
      }
      
      return new Response(
        JSON.stringify({
          premium: true,
          planType: user.plan_type,
          deviceMatch: true
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const { data: familyMembership } = await supabase
      .from("family_members")
      .select(`
        id,
        family_group_id,
        accepted,
        family_groups (
          owner_id
        )
      `)
      .eq("user_id", userId)
      .eq("accepted", true)
      .maybeSingle();
    
    if (familyMembership && familyMembership.family_groups) {
      const { data: owner } = await supabase
        .from("users")
        .select("premium, plan_type")
        .eq("id", familyMembership.family_groups.owner_id)
        .eq("premium", true)
        .eq("plan_type", "family")
        .maybeSingle();
      
      if (owner) {
        const deviceMatch = user?.active_device_id === deviceId;
        
        if (!deviceMatch) {
          if (user?.active_device_id) {
            console.log(`[ValidatePremium] Family member device mismatch for user ${userId}`);
            return new Response(
              JSON.stringify({
                premium: false,
                requiresDeviceTransfer: true,
                planType: "family",
                familyGroupId: familyMembership.family_group_id
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          
          await supabase
            .from("users")
            .upsert({
              id: userId,
              active_device_id: deviceId,
              updated_at: new Date().toISOString()
            }, { onConflict: "id" });
        }
        
        return new Response(
          JSON.stringify({
            premium: true,
            planType: "family",
            familyGroupId: familyMembership.family_group_id,
            deviceMatch: true,
            isOwner: false
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    
    return new Response(
      JSON.stringify({
        premium: false,
        planType: null,
        deviceMatch: true
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Validation error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
