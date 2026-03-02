-- ============================================================
-- CASCADE DELETE CONSTRAINTS FOR ACCOUNT DELETION
-- Run this in Supabase SQL Editor to ensure all user data
-- is automatically cleaned up when a profile is deleted.
-- ============================================================

-- The delete-user-account Edge Function handles deletion order
-- explicitly, but these cascades act as a safety net.

-- revision_items → profiles
ALTER TABLE revision_items
  DROP CONSTRAINT IF EXISTS revision_items_user_id_fkey,
  ADD CONSTRAINT revision_items_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- event_entries → profiles
ALTER TABLE event_entries
  DROP CONSTRAINT IF EXISTS event_entries_user_id_fkey,
  ADD CONSTRAINT event_entries_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- push_tokens → profiles
ALTER TABLE push_tokens
  DROP CONSTRAINT IF EXISTS push_tokens_user_id_fkey,
  ADD CONSTRAINT push_tokens_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- daily_quests → profiles
ALTER TABLE daily_quests
  DROP CONSTRAINT IF EXISTS daily_quests_user_id_fkey,
  ADD CONSTRAINT daily_quests_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- leaderboard_snapshots → profiles
ALTER TABLE leaderboard_snapshots
  DROP CONSTRAINT IF EXISTS leaderboard_snapshots_user_id_fkey,
  ADD CONSTRAINT leaderboard_snapshots_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- profiles themselves cascade from auth.users
-- (should already be set up by Supabase trigger)
ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_user_id_fkey,
  ADD CONSTRAINT profiles_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ============================================================
-- VERIFY: After running, test with:
--   SELECT conname, confdeltype FROM pg_constraint
--   WHERE contype = 'f' AND conrelid IN (
--     'profiles'::regclass, 'push_tokens'::regclass
--   );
-- confdeltype 'c' = CASCADE
-- ============================================================
