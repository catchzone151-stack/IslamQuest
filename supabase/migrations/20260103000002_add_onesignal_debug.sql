CREATE TABLE IF NOT EXISTS onesignal_debug (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  platform TEXT NOT NULL,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  has_subscription_id BOOLEAN NOT NULL DEFAULT FALSE,
  subscription_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_onesignal_debug_user_id ON onesignal_debug(user_id);
CREATE INDEX IF NOT EXISTS idx_onesignal_debug_attempted_at ON onesignal_debug(attempted_at DESC);
