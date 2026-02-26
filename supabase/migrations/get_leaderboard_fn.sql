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
