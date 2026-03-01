-- Add streak_active column to profiles table
-- Tracks whether a user currently has an active (unbroken) streak
-- Safe to run multiple times (idempotent)

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS streak_active BOOLEAN NOT NULL DEFAULT true;

-- Back-fill: mark existing rows based on current streak value
UPDATE profiles
SET streak_active = (streak > 0)
WHERE streak_active IS DISTINCT FROM (streak > 0);

-- Index for leaderboard/filter queries
CREATE INDEX IF NOT EXISTS idx_profiles_streak_active ON profiles (streak_active);
