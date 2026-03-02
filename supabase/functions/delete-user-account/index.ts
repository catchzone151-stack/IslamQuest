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

    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await adminClient.auth.getUser(token);

    if (authError || !userData?.user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = userData.user.id;
    console.log(`[DeleteAccount] Starting deletion for user: ${userId}`);

    const errors: string[] = [];

    const safeDelete = async (table: string, column = "user_id", extraFilter?: { column: string; value: string }) => {
      try {
        let query = adminClient.from(table).delete().eq(column, userId);
        const { error } = await query;
        if (error) {
          console.warn(`[DeleteAccount] Warning deleting ${table}:`, error.message);
          errors.push(`${table}: ${error.message}`);
        } else {
          console.log(`[DeleteAccount] ✓ Deleted from ${table}`);
        }
      } catch (e) {
        console.warn(`[DeleteAccount] Exception deleting ${table}:`, e);
        errors.push(`${table}: exception`);
      }
    };

    const safeDeleteOr = async (table: string, colA: string, colB: string) => {
      try {
        const { error } = await adminClient
          .from(table)
          .delete()
          .or(`${colA}.eq.${userId},${colB}.eq.${userId}`);
        if (error) {
          console.warn(`[DeleteAccount] Warning deleting ${table}:`, error.message);
          errors.push(`${table}: ${error.message}`);
        } else {
          console.log(`[DeleteAccount] ✓ Deleted from ${table} (or filter)`);
        }
      } catch (e) {
        console.warn(`[DeleteAccount] Exception deleting ${table}:`, e);
        errors.push(`${table}: exception`);
      }
    };

    // ─── Step 1: Leaf tables (no FK dependencies) ───────────────────────────
    await safeDelete("revision_items");
    await safeDelete("event_entries");
    await safeDelete("push_tokens");
    await safeDelete("daily_quests");
    await safeDelete("lesson_progress");
    await safeDelete("challenge_logs");
    await safeDelete("xp_logs");
    await safeDelete("streak_logs");
    await safeDelete("leaderboard_snapshots");
    await safeDelete("purchases");
    await safeDelete("analytics_events");

    // ─── Step 2: Challenge records (both sides) ──────────────────────────────
    await safeDeleteOr("friend_challenges", "challenger_id", "challenged_id");

    // ─── Step 3: Social graph ─────────────────────────────────────────────────
    await safeDeleteOr("friend_requests", "from_user", "to_user");
    await safeDeleteOr("friendships", "user1_id", "user2_id");

    // ─── Step 4: Family groups (delete members first, then owned groups) ─────
    try {
      const { data: ownedGroups } = await adminClient
        .from("family_groups")
        .select("id")
        .eq("owner_id", userId);

      if (ownedGroups && ownedGroups.length > 0) {
        for (const group of ownedGroups) {
          await adminClient.from("family_members").delete().eq("family_group_id", group.id);
        }
        await adminClient.from("family_groups").delete().eq("owner_id", userId);
        console.log("[DeleteAccount] ✓ Deleted owned family groups");
      }
    } catch (e) {
      console.warn("[DeleteAccount] Family group deletion warning:", e);
    }
    await safeDelete("family_members");

    // ─── Step 5: Legacy users table (if exists) ───────────────────────────────
    try {
      await adminClient.from("users").delete().eq("id", userId);
    } catch (_) {}

    // ─── Step 6: Profile (must come after all FK children) ───────────────────
    await safeDelete("profiles");

    // ─── Step 7: Delete auth user (irreversible — do last) ───────────────────
    const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(userId);

    if (deleteAuthError) {
      console.error("[DeleteAccount] Auth deletion error:", deleteAuthError);
      return new Response(
        JSON.stringify({ error: "Failed to delete authentication record", warnings: errors }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[DeleteAccount] ✓ Successfully deleted user: ${userId}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Account deleted successfully",
        warnings: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[DeleteAccount] Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Account deletion failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
