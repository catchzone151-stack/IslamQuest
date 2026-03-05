-- ============================================================
-- Run this in Supabase SQL Editor (one-time).
-- 1. Adds case-insensitive UNIQUE index on profiles.handle
-- 2. Replaces handle_new_user trigger to read raw_user_meta_data
-- 3. Replaces create_profile_if_missing to return jsonb so callers
--    can detect handle collisions and inform the user.
-- ============================================================

-- 1. UNIQUE index on lower(handle) — enforces case-insensitive uniqueness
--    at the database level.  Fails if existing rows already have duplicate
--    handles — clean those up first if the statement errors.
CREATE UNIQUE INDEX IF NOT EXISTS profiles_handle_lower_unique
  ON public.profiles (LOWER(handle));

-- 2. Trigger function — fires AFTER INSERT ON auth.users
--    Reads desired_username / desired_handle / desired_avatar_index from
--    raw_user_meta_data written by supabase.auth.signUp({ options.data }).
--    Falls back to safe generated values if metadata is absent.
--    On handle collision (unique_violation) falls back to user_<id_prefix>.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_username  text;
  v_handle    text;
  v_avatar    int;
  v_fallback  text;
BEGIN
  -- Read metadata written by supabase.auth.signUp options.data
  v_username := NULLIF(TRIM(NEW.raw_user_meta_data->>'desired_username'), '');
  v_handle   := NULLIF(LOWER(TRIM(NEW.raw_user_meta_data->>'desired_handle')), '');

  -- Safe integer cast for avatar index (guards against non-numeric metadata)
  BEGIN
    v_avatar := COALESCE((NEW.raw_user_meta_data->>'desired_avatar_index')::int, 0);
  EXCEPTION WHEN OTHERS THEN
    v_avatar := 0;
  END;

  -- Apply safe defaults when metadata is missing
  v_username := COALESCE(v_username, 'User');
  v_handle   := COALESCE(v_handle,   'user_' || SUBSTR(NEW.id::text, 1, 8));
  v_fallback := 'user_' || SUBSTR(NEW.id::text, 1, 8);

  BEGIN
    INSERT INTO public.profiles
      (user_id, username, handle, avatar, xp, coins, streak, created_at, updated_at)
    VALUES
      (NEW.id, v_username, v_handle, v_avatar, 0, 0, 0, now(), now());
  EXCEPTION
    WHEN unique_violation THEN
      -- Desired handle was taken between availability check and account creation.
      -- Fall back to the user_id-prefixed handle (guaranteed unique).
      INSERT INTO public.profiles
        (user_id, username, handle, avatar, xp, coins, streak, created_at, updated_at)
      VALUES
        (NEW.id, v_username, v_fallback, v_avatar, 0, 0, 0, now(), now())
      ON CONFLICT (user_id) DO NOTHING;
  END;

  RETURN NEW;
END;
$$;

-- Drop and recreate the trigger (safe: CREATE OR REPLACE on function above already
-- updates the body, but the trigger binding may need refreshing).
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Replace create_profile_if_missing to return jsonb.
--    Callers receive { handle_used, handle_collision } so they can alert the user
--    if the chosen handle was substituted.
--    Must DROP first because PostgreSQL cannot change a function's return type
--    with CREATE OR REPLACE alone.
DROP FUNCTION IF EXISTS public.create_profile_if_missing(text, text, int);

CREATE FUNCTION public.create_profile_if_missing(
  p_username    text DEFAULT 'User',
  p_handle      text DEFAULT NULL,
  p_avatar_index int DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id         uuid := auth.uid();
  v_handle          text;
  v_final_handle    text;
  v_handle_collision boolean := false;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Idempotent: if profile already exists, return its current handle.
  IF EXISTS (SELECT 1 FROM profiles WHERE user_id = v_user_id) THEN
    SELECT handle INTO v_final_handle FROM profiles WHERE user_id = v_user_id;
    RETURN jsonb_build_object(
      'handle_used',      v_final_handle,
      'handle_collision', false
    );
  END IF;

  v_handle       := NULLIF(LOWER(TRIM(COALESCE(p_handle, ''))), '');
  v_final_handle := COALESCE(v_handle, 'user_' || SUBSTR(v_user_id::text, 1, 8));

  BEGIN
    INSERT INTO profiles
      (user_id, username, handle, avatar, xp, coins, streak, created_at, updated_at)
    VALUES (
      v_user_id,
      COALESCE(NULLIF(TRIM(p_username), ''), 'User'),
      v_final_handle,
      p_avatar_index,
      0, 0, 0,
      now(), now()
    );
  EXCEPTION
    WHEN unique_violation THEN
      v_handle_collision := true;
      v_final_handle     := 'user_' || SUBSTR(v_user_id::text, 1, 8);
      INSERT INTO profiles
        (user_id, username, handle, avatar, xp, coins, streak, created_at, updated_at)
      VALUES (
        v_user_id,
        COALESCE(NULLIF(TRIM(p_username), ''), 'User'),
        v_final_handle,
        p_avatar_index,
        0, 0, 0,
        now(), now()
      )
      ON CONFLICT (user_id) DO NOTHING;
  END;

  RETURN jsonb_build_object(
    'handle_used',      v_final_handle,
    'handle_collision', v_handle_collision
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_profile_if_missing(text, text, int) TO authenticated;
