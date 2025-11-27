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

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !userData?.user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = userData.user.id;
    console.log(`[DeleteAccount] Starting deletion for user: ${userId}`);

    await supabase.from("revision_items").delete().eq("user_id", userId);
    console.log("[DeleteAccount] Deleted revision items");

    await supabase.from("event_entries").delete().eq("user_id", userId);
    console.log("[DeleteAccount] Deleted event entries");

    await supabase.from("push_tokens").delete().eq("user_id", userId);
    console.log("[DeleteAccount] Deleted push tokens");

    await supabase.from("friend_requests").delete().or(`from_user.eq.${userId},to_user.eq.${userId}`);
    console.log("[DeleteAccount] Deleted friend requests");

    await supabase.from("friendships").delete().or(`user1_id.eq.${userId},user2_id.eq.${userId}`);
    console.log("[DeleteAccount] Deleted friendships");

    const { data: ownedGroups } = await supabase
      .from("family_groups")
      .select("id")
      .eq("owner_id", userId);

    if (ownedGroups && ownedGroups.length > 0) {
      for (const group of ownedGroups) {
        await supabase.from("family_members").delete().eq("family_group_id", group.id);
      }
      await supabase.from("family_groups").delete().eq("owner_id", userId);
      console.log("[DeleteAccount] Deleted owned family groups and members");
    }

    await supabase.from("family_members").delete().eq("user_id", userId);
    console.log("[DeleteAccount] Removed from family memberships");

    await supabase.from("purchases").delete().eq("user_id", userId);
    console.log("[DeleteAccount] Deleted purchases");

    await supabase.from("users").delete().eq("id", userId);
    console.log("[DeleteAccount] Deleted users record");

    await supabase.from("profiles").delete().eq("user_id", userId);
    console.log("[DeleteAccount] Deleted profile");

    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId);
    
    if (deleteAuthError) {
      console.error("[DeleteAccount] Auth deletion error:", deleteAuthError);
      return new Response(
        JSON.stringify({ error: "Failed to delete authentication" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[DeleteAccount] Successfully deleted user: ${userId}`);

    return new Response(
      JSON.stringify({ success: true, message: "Account deleted successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[DeleteAccount] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Account deletion failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
