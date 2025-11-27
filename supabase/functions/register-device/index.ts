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
    
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("active_device_id")
      .eq("id", userId)
      .maybeSingle();
    
    if (fetchError) {
      console.error("User fetch error:", fetchError);
    }
    
    let isNewDevice = false;
    let previousDeviceLoggedOut = false;
    
    if (!user) {
      const { error: insertError } = await supabase
        .from("users")
        .insert({
          id: userId,
          active_device_id: deviceId,
          premium: false,
          created_at: new Date().toISOString()
        });
      
      if (insertError) {
        console.error("User insert error:", insertError);
      }
      
      isNewDevice = true;
    } else if (!user.active_device_id) {
      const { error: updateError } = await supabase
        .from("users")
        .update({ 
          active_device_id: deviceId,
          updated_at: new Date().toISOString()
        })
        .eq("id", userId);
      
      if (updateError) {
        console.error("Device update error:", updateError);
      }
      
      isNewDevice = true;
    } else if (user.active_device_id !== deviceId) {
      const { error: updateError } = await supabase
        .from("users")
        .update({ 
          active_device_id: deviceId,
          updated_at: new Date().toISOString()
        })
        .eq("id", userId);
      
      if (updateError) {
        console.error("Device switch error:", updateError);
      }
      
      isNewDevice = true;
      previousDeviceLoggedOut = true;
      
      console.log(`[DeviceLimit] User ${userId} switched from device ${user.active_device_id} to ${deviceId}`);
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        isNewDevice: isNewDevice,
        previousDeviceLoggedOut: previousDeviceLoggedOut
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Device registration error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
