-- Run this once in the Supabase SQL Editor.
-- Creates a SECURITY DEFINER function that bypasses RLS on the profiles table
-- so the global leaderboard can read all profiles regardless of per-row policies.

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
