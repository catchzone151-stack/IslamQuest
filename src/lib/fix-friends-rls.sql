-- Fix RLS policies on friends table to allow recipients to see pending requests
-- Run this in your Supabase SQL Editor

-- First, drop existing policies on friends table (if any)
DROP POLICY IF EXISTS "Users can view their own friend relationships" ON friends;
DROP POLICY IF EXISTS "Users can insert friend requests" ON friends;
DROP POLICY IF EXISTS "Users can update friend relationships" ON friends;
DROP POLICY IF EXISTS "Users can delete friend relationships" ON friends;
DROP POLICY IF EXISTS "friends_select_policy" ON friends;
DROP POLICY IF EXISTS "friends_insert_policy" ON friends;
DROP POLICY IF EXISTS "friends_update_policy" ON friends;
DROP POLICY IF EXISTS "friends_delete_policy" ON friends;

-- Enable RLS on friends table (if not already enabled)
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can see rows where they are EITHER the sender OR receiver
CREATE POLICY "friends_select_policy" ON friends
  FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- INSERT: Only the sender (user_id) can create a friend request
CREATE POLICY "friends_insert_policy" ON friends
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Both sender and receiver can update (receiver needs this to accept)
CREATE POLICY "friends_update_policy" ON friends
  FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- DELETE: Both sender and receiver can delete (cancel or decline)
CREATE POLICY "friends_delete_policy" ON friends
  FOR DELETE
  USING (auth.uid() = user_id OR auth.uid() = friend_id);
