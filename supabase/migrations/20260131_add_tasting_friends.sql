-- =============================================
-- TASTING FRIENDS: Track who you tasted with
-- =============================================

-- Junction table for tasting participants
CREATE TABLE IF NOT EXISTS tasting_friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tasting_id UUID REFERENCES tastings(id) ON DELETE CASCADE NOT NULL,
  friend_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_tasting_friend UNIQUE (tasting_id, friend_id)
);

ALTER TABLE tasting_friends ENABLE ROW LEVEL SECURITY;

-- Users can view friends on their own tastings
CREATE POLICY "View friends on own tastings" ON tasting_friends
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tastings
      WHERE tastings.id = tasting_friends.tasting_id
      AND tastings.user_id = auth.uid()
    )
  );

-- Users can add anyone to their own tastings
-- (visibility is controlled by friendship status in the app queries)
CREATE POLICY "Add friends to own tastings" ON tasting_friends
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM tastings
      WHERE tastings.id = tasting_friends.tasting_id
      AND tastings.user_id = auth.uid()
    )
  );

-- Users can remove friends from their own tastings
CREATE POLICY "Remove friends from own tastings" ON tasting_friends
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM tastings
      WHERE tastings.id = tasting_friends.tasting_id
      AND tastings.user_id = auth.uid()
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasting_friends_tasting_id ON tasting_friends(tasting_id);
CREATE INDEX IF NOT EXISTS idx_tasting_friends_friend_id ON tasting_friends(friend_id);
