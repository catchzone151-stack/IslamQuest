-- Run this once in the Supabase SQL Editor.
-- Creates SECURITY DEFINER functions that bypass RLS on the profiles table.

-- 1. Global leaderboard — returns all profiles sorted by XP
CREATE OR REPLACE FUNCTION public.get_leaderboard()
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
AS $$
  SELECT json_agg(t ORDER BY t.xp DESC)
  FROM (
    SELECT user_id::text, username, handle, avatar, xp, streak
    FROM profiles
  ) t;
$$;

GRANT EXECUTE ON FUNCTION public.get_leaderboard() TO authenticated, anon;

-- 2. Batch profile lookup by IDs — used by the friends list to fetch friend profiles
CREATE OR REPLACE FUNCTION public.get_profiles_by_ids(ids text[])
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
AS $$
  SELECT json_agg(t)
  FROM (
    SELECT user_id::text, username, handle, avatar, xp, streak, coins, shield_count
    FROM profiles
    WHERE user_id::text = ANY(ids)
  ) t;
$$;

GRANT EXECUTE ON FUNCTION public.get_profiles_by_ids(text[]) TO authenticated, anon;

-- 3. User search by handle or username — used by the Search tab
CREATE OR REPLACE FUNCTION public.search_profiles(search_query text)
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
AS $$
  SELECT json_agg(t)
  FROM (
    SELECT DISTINCT user_id::text, username, handle, avatar, xp, streak
    FROM profiles
    WHERE handle ILIKE '%' || search_query || '%'
       OR username ILIKE '%' || search_query || '%'
    LIMIT 20
  ) t;
$$;

GRANT EXECUTE ON FUNCTION public.search_profiles(text) TO authenticated, anon;

-- 4. Send friend request — handles duplicate/mutual/already-friends cases atomically
CREATE OR REPLACE FUNCTION public.send_friend_request(p_target uuid)
RETURNS jsonb
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_me uuid := auth.uid();
  v_row friends%ROWTYPE;
BEGIN
  IF v_me IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF v_me = p_target THEN
    RETURN '{"status":"self"}'::jsonb;
  END IF;

  SELECT * INTO v_row
  FROM friends
  WHERE (user_id = v_me AND friend_id = p_target)
     OR (user_id = p_target AND friend_id = v_me)
  LIMIT 1;

  IF FOUND THEN
    IF v_row.status = 'accepted' THEN
      RETURN '{"status":"already_friends"}'::jsonb;
    ELSIF v_row.user_id = v_me AND v_row.status = 'pending' THEN
      RETURN '{"status":"pending_sent"}'::jsonb;
    ELSIF v_row.friend_id = v_me AND v_row.status = 'pending' THEN
      UPDATE friends SET status = 'accepted' WHERE id = v_row.id;
      RETURN '{"status":"accepted"}'::jsonb;
    END IF;
  END IF;

  INSERT INTO friends (user_id, friend_id, status) VALUES (v_me, p_target, 'pending');
  RETURN '{"status":"sent"}'::jsonb;
END;
$$;

GRANT EXECUTE ON FUNCTION public.send_friend_request(uuid) TO authenticated;
