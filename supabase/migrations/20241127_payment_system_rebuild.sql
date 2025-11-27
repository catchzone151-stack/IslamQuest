-- Payment System Rebuild Migration
-- Creates/updates tables for lifetime IAP with device limit and family plans

-- Users table (core user data with device binding)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  premium BOOLEAN DEFAULT FALSE,
  plan_type TEXT CHECK (plan_type IN ('single', 'family')),
  active_device_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for device lookups
CREATE INDEX IF NOT EXISTS idx_users_active_device ON users(active_device_id);

-- Purchases table (IAP receipts with verification status)
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android')),
  product_id TEXT NOT NULL,
  receipt_token TEXT NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  refunded BOOLEAN DEFAULT FALSE,
  nonce TEXT,
  device_id TEXT,
  order_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for purchase lookups
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_receipt_token ON purchases(receipt_token);
CREATE INDEX IF NOT EXISTS idx_purchases_verified ON purchases(verified) WHERE verified = true;

-- Prevent duplicate receipt submissions
CREATE UNIQUE INDEX IF NOT EXISTS idx_purchases_receipt_unique 
  ON purchases(receipt_token) 
  WHERE verified = true;

-- Family groups table (owner manages up to 5 members)
CREATE TABLE IF NOT EXISTS family_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  max_members INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Only one family group per owner
CREATE UNIQUE INDEX IF NOT EXISTS idx_family_groups_owner ON family_groups(owner_id);

-- Family members table (invites and accepted members)
CREATE TABLE IF NOT EXISTS family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_group_id UUID REFERENCES family_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  invited_email TEXT,
  invite_token TEXT UNIQUE,
  accepted BOOLEAN DEFAULT FALSE,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for family member lookups
CREATE INDEX IF NOT EXISTS idx_family_members_group ON family_members(family_group_id);
CREATE INDEX IF NOT EXISTS idx_family_members_user ON family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_family_members_token ON family_members(invite_token);
CREATE INDEX IF NOT EXISTS idx_family_members_email ON family_members(invited_email);

-- RLS Policies

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

-- Users: Users can read/update their own data
DROP POLICY IF EXISTS users_select_own ON users;
CREATE POLICY users_select_own ON users FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS users_update_own ON users;
CREATE POLICY users_update_own ON users FOR UPDATE USING (auth.uid() = id);

-- Purchases: Users can read their own purchases
DROP POLICY IF EXISTS purchases_select_own ON purchases;
CREATE POLICY purchases_select_own ON purchases FOR SELECT USING (auth.uid() = user_id);

-- Family groups: Owners can manage their groups
DROP POLICY IF EXISTS family_groups_select ON family_groups;
CREATE POLICY family_groups_select ON family_groups FOR SELECT USING (
  auth.uid() = owner_id OR 
  EXISTS (
    SELECT 1 FROM family_members 
    WHERE family_members.family_group_id = family_groups.id 
    AND family_members.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS family_groups_insert ON family_groups;
CREATE POLICY family_groups_insert ON family_groups FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Family members: Members can view their own membership
DROP POLICY IF EXISTS family_members_select ON family_members;
CREATE POLICY family_members_select ON family_members FOR SELECT USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM family_groups 
    WHERE family_groups.id = family_members.family_group_id 
    AND family_groups.owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS family_members_insert ON family_members;
CREATE POLICY family_members_insert ON family_members FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM family_groups 
    WHERE family_groups.id = family_group_id 
    AND family_groups.owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS family_members_delete ON family_members;
CREATE POLICY family_members_delete ON family_members FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM family_groups 
    WHERE family_groups.id = family_members.family_group_id 
    AND family_groups.owner_id = auth.uid()
  )
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
DROP TRIGGER IF EXISTS users_updated_at ON users;
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
