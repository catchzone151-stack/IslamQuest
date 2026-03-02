-- Run this in the Supabase SQL Editor
-- Creates a SECURITY DEFINER function so users can delete their own data
-- without needing an edge function or service-role key on the client.

CREATE OR REPLACE FUNCTION public.delete_my_account()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  uid uuid := auth.uid();
  owned_group_ids uuid[];
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- ── Step 1: Leaf tables (no FK dependencies) ────────────────────────────
  DELETE FROM revision_items      WHERE user_id = uid;
  DELETE FROM event_entries       WHERE user_id = uid;
  DELETE FROM push_tokens         WHERE user_id = uid;
  DELETE FROM daily_quests        WHERE user_id = uid;
  DELETE FROM lesson_progress     WHERE user_id = uid;
  DELETE FROM challenge_logs      WHERE user_id = uid;
  DELETE FROM xp_logs             WHERE user_id = uid;
  DELETE FROM streak_logs         WHERE user_id = uid;
  DELETE FROM leaderboard_snapshots WHERE user_id = uid;
  DELETE FROM purchases           WHERE user_id = uid;
  DELETE FROM analytics_events    WHERE user_id = uid;

  -- ── Step 2: Challenge records (both sides) ───────────────────────────────
  DELETE FROM friend_challenges
    WHERE challenger_id = uid OR challenged_id = uid;

  -- ── Step 3: Social graph ──────────────────────────────────────────────────
  DELETE FROM friend_requests
    WHERE from_user = uid OR to_user = uid;
  DELETE FROM friendships
    WHERE user1_id = uid OR user2_id = uid;

  -- ── Step 4: Family groups ─────────────────────────────────────────────────
  SELECT ARRAY_AGG(id) INTO owned_group_ids
    FROM family_groups WHERE owner_id = uid;

  IF owned_group_ids IS NOT NULL THEN
    DELETE FROM family_members
      WHERE family_group_id = ANY(owned_group_ids);
    DELETE FROM family_groups WHERE owner_id = uid;
  END IF;

  DELETE FROM family_members WHERE user_id = uid;

  -- ── Step 5: Profile (must come after all FK children) ────────────────────
  DELETE FROM profiles WHERE id = uid;

  -- ── Step 6: Delete auth user ──────────────────────────────────────────────
  -- auth.users deletion requires elevated privilege; done via the
  -- supabase_admin role which SECURITY DEFINER grants us access to.
  DELETE FROM auth.users WHERE id = uid;

  RETURN jsonb_build_object('success', true);

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Only authenticated users can call this; they can only delete themselves
-- because auth.uid() is used internally.
REVOKE ALL ON FUNCTION public.delete_my_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_my_account() TO authenticated;
