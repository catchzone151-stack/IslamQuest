-- Run this once in the Supabase SQL Editor.
-- Creates SECURITY DEFINER functions that bypass RLS on the profiles table.

-- 0. Verified-users-only view — leaderboard and search only show confirmed accounts
CREATE OR REPLACE VIEW public.profiles_verified AS
  SELECT *
  FROM public.profiles p
  WHERE EXISTS (
    SELECT 1 FROM auth.users u
    WHERE u.id = p.user_id
      AND u.email_confirmed_at IS NOT NULL
  );

-- 1. Global leaderboard — returns only email-verified profiles sorted by XP
CREATE OR REPLACE FUNCTION public.get_leaderboard()
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
AS $$
  SELECT json_agg(t ORDER BY t.xp DESC)
  FROM (
    SELECT user_id::text, username, handle, avatar, xp, streak
    FROM profiles_verified
  ) t;
$$;

GRANT EXECUTE ON FUNCTION public.get_leaderboard() TO authenticated, anon;

-- 2. Batch profile lookup by IDs — used by the friends list and event leaderboard
CREATE OR REPLACE FUNCTION public.get_profiles_by_ids(ids text[])
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
AS $$
  SELECT json_agg(t)
  FROM (
    SELECT user_id::text, username, handle, avatar, xp, streak, coins, shield_count, premium
    FROM profiles
    WHERE user_id::text = ANY(ids)
  ) t;
$$;

GRANT EXECUTE ON FUNCTION public.get_profiles_by_ids(text[]) TO authenticated, anon;

-- 3. User search by handle or username — only searches verified accounts
CREATE OR REPLACE FUNCTION public.search_profiles(search_query text)
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
AS $$
  SELECT json_agg(t)
  FROM (
    SELECT DISTINCT user_id::text, username, handle, avatar, xp, streak
    FROM profiles_verified
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

-- 5. Create profile if missing — called after email confirmation as a safe fallback
--    Inserts ONLY if no row exists for auth.uid(). Idempotent: safe to call multiple times.
--    If the desired handle is already taken, falls back to a generated handle.
CREATE OR REPLACE FUNCTION public.create_profile_if_missing(
  p_username text DEFAULT 'User',
  p_handle text DEFAULT NULL,
  p_avatar_index int DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_handle text;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Nothing to do if profile already exists
  IF EXISTS (SELECT 1 FROM profiles WHERE user_id = v_user_id) THEN
    RETURN;
  END IF;

  v_handle := NULLIF(TRIM(COALESCE(p_handle, '')), '');

  BEGIN
    INSERT INTO profiles (user_id, username, handle, avatar, xp, coins, streak, created_at, updated_at)
    VALUES (
      v_user_id,
      COALESCE(NULLIF(TRIM(p_username), ''), 'User'),
      COALESCE(v_handle, 'user_' || SUBSTR(v_user_id::text, 1, 8)),
      p_avatar_index,
      0, 0, 0,
      now(), now()
    );
  EXCEPTION
    WHEN unique_violation THEN
      -- Handle was taken — fall back to generated handle based on user_id
      INSERT INTO profiles (user_id, username, handle, avatar, xp, coins, streak, created_at, updated_at)
      VALUES (
        v_user_id,
        COALESCE(NULLIF(TRIM(p_username), ''), 'User'),
        'user_' || SUBSTR(v_user_id::text, 1, 8),
        p_avatar_index,
        0, 0, 0,
        now(), now()
      )
      ON CONFLICT (user_id) DO NOTHING;
  END;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_profile_if_missing(text, text, int) TO authenticated;
