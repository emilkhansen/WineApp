-- Update RLS policies to allow friends to view all wines/tastings (not just public ones)
-- Run this in your Supabase SQL Editor

-- Drop old policies
DROP POLICY IF EXISTS "Friends can view public wines" ON wines;
DROP POLICY IF EXISTS "Friends can view public tastings" ON tastings;

-- Create new policy: Friends can view all wines
CREATE POLICY "Friends can view wines" ON wines
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM friendships
      WHERE status = 'accepted'
      AND (
        (user_id = auth.uid() AND friend_id = wines.user_id) OR
        (friend_id = auth.uid() AND user_id = wines.user_id)
      )
    )
  );

-- Create new policy: Friends can view all tastings
CREATE POLICY "Friends can view tastings" ON tastings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM friendships
      WHERE status = 'accepted'
      AND (
        (user_id = auth.uid() AND friend_id = tastings.user_id) OR
        (friend_id = auth.uid() AND user_id = tastings.user_id)
      )
    )
  );
