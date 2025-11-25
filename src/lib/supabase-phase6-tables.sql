-- =====================================================
-- PHASE 6: CHALLENGES + GLOBAL EVENTS TABLES
-- Run this SQL in your Supabase SQL Editor
-- =====================================================

-- TABLE 1: challenges
-- Stores friend-to-friend challenges (real users only - no AI)
-- =====================================================
CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_id UUID NOT NULL,
  opponent_id UUID NOT NULL,
  mode VARCHAR(50) NOT NULL,
  questions JSONB NOT NULL,
  
  challenger_score INTEGER DEFAULT NULL,
  challenger_answers JSONB DEFAULT NULL,
  challenger_time REAL DEFAULT NULL,
  challenger_chain INTEGER DEFAULT NULL,
  challenger_played_at TIMESTAMPTZ DEFAULT NULL,
  
  opponent_score INTEGER DEFAULT NULL,
  opponent_answers JSONB DEFAULT NULL,
  opponent_time REAL DEFAULT NULL,
  opponent_chain INTEGER DEFAULT NULL,
  opponent_played_at TIMESTAMPTZ DEFAULT NULL,
  
  status VARCHAR(20) DEFAULT 'pending',
  winner_id UUID DEFAULT NULL,
  is_draw BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_challenges_challenger ON challenges(challenger_id);
CREATE INDEX IF NOT EXISTS idx_challenges_opponent ON challenges(opponent_id);
CREATE INDEX IF NOT EXISTS idx_challenges_status ON challenges(status);
CREATE INDEX IF NOT EXISTS idx_challenges_expires ON challenges(expires_at);
CREATE INDEX IF NOT EXISTS idx_challenges_created ON challenges(created_at DESC);

ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own challenges" ON challenges;
CREATE POLICY "Users can view their own challenges" ON challenges
  FOR SELECT USING (
    auth.uid() = challenger_id OR auth.uid() = opponent_id
  );

DROP POLICY IF EXISTS "Users can create challenges" ON challenges;
CREATE POLICY "Users can create challenges" ON challenges
  FOR INSERT WITH CHECK (auth.uid() = challenger_id);

DROP POLICY IF EXISTS "Users can update their own challenges" ON challenges;
CREATE POLICY "Users can update their own challenges" ON challenges
  FOR UPDATE USING (
    auth.uid() = challenger_id OR auth.uid() = opponent_id
  );

-- TABLE 2: boss_attempts
-- Tracks daily Boss Level attempts (one per day per user)
-- =====================================================
CREATE TABLE IF NOT EXISTS boss_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  attempt_date DATE NOT NULL,
  score INTEGER NOT NULL,
  answers JSONB DEFAULT NULL,
  completion_time REAL DEFAULT NULL,
  passed BOOLEAN DEFAULT FALSE,
  xp_earned INTEGER DEFAULT 0,
  coins_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, attempt_date)
);

CREATE INDEX IF NOT EXISTS idx_boss_attempts_user ON boss_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_boss_attempts_date ON boss_attempts(attempt_date);
CREATE INDEX IF NOT EXISTS idx_boss_attempts_user_date ON boss_attempts(user_id, attempt_date);

ALTER TABLE boss_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own boss attempts" ON boss_attempts;
CREATE POLICY "Users can view their own boss attempts" ON boss_attempts
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own boss attempts" ON boss_attempts;
CREATE POLICY "Users can create their own boss attempts" ON boss_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own boss attempts" ON boss_attempts;
CREATE POLICY "Users can update their own boss attempts" ON boss_attempts
  FOR UPDATE USING (auth.uid() = user_id);

-- TABLE 3: event_entries
-- Stores user entries for weekly Global Events
-- =====================================================
CREATE TABLE IF NOT EXISTS event_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  event_id VARCHAR(50) NOT NULL,
  week_id VARCHAR(20) NOT NULL,
  score INTEGER NOT NULL,
  answers JSONB DEFAULT NULL,
  completion_time REAL DEFAULT NULL,
  provisional_rank INTEGER DEFAULT NULL,
  final_rank INTEGER DEFAULT NULL,
  rewards_claimed BOOLEAN DEFAULT FALSE,
  xp_earned INTEGER DEFAULT 0,
  coins_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, event_id, week_id)
);

CREATE INDEX IF NOT EXISTS idx_event_entries_user ON event_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_event_entries_event_week ON event_entries(event_id, week_id);
CREATE INDEX IF NOT EXISTS idx_event_entries_score ON event_entries(score DESC);
CREATE INDEX IF NOT EXISTS idx_event_entries_week_score ON event_entries(week_id, event_id, score DESC);

ALTER TABLE event_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all event entries" ON event_entries;
CREATE POLICY "Users can view all event entries" ON event_entries
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create their own event entries" ON event_entries;
CREATE POLICY "Users can create their own event entries" ON event_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own event entries" ON event_entries;
CREATE POLICY "Users can update their own event entries" ON event_entries
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- VERIFICATION QUERIES (run after creating tables)
-- =====================================================
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('challenges', 'boss_attempts', 'event_entries');
