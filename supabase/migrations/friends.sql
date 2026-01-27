-- =============================================
-- FRIENDS FEATURE: Profiles & Friendships
-- =============================================

-- Add is_public column to wines table (required for friend visibility policies)
ALTER TABLE wines ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false NOT NULL;

-- Profiles table (extends auth.users with username)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles viewable by authenticated users" ON profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Apply updated_at trigger to profiles
DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Friendship status enum
DO $$ BEGIN
  CREATE TYPE friendship_status AS ENUM ('pending', 'accepted');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Friendships table
CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  friend_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status friendship_status DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_friendship UNIQUE (user_id, friend_id),
  CONSTRAINT no_self_friendship CHECK (user_id != friend_id)
);

ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View own friendships" ON friendships
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Send friend requests" ON friendships
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Accept/reject as recipient" ON friendships
  FOR UPDATE USING (auth.uid() = friend_id);

CREATE POLICY "Delete own friendships" ON friendships
  FOR DELETE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Indexes for friendships
CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Policy for viewing public wines of friends
CREATE POLICY "Friends can view public wines" ON wines
  FOR SELECT USING (
    is_public = true AND EXISTS (
      SELECT 1 FROM friendships
      WHERE status = 'accepted'
      AND (
        (user_id = auth.uid() AND friend_id = wines.user_id) OR
        (friend_id = auth.uid() AND user_id = wines.user_id)
      )
    )
  );

-- Policy for viewing public tastings of friends
CREATE POLICY "Friends can view public tastings" ON tastings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM wines w
      WHERE w.id = tastings.wine_id
      AND w.is_public = true
      AND EXISTS (
        SELECT 1 FROM friendships
        WHERE status = 'accepted'
        AND (
          (user_id = auth.uid() AND friend_id = tastings.user_id) OR
          (friend_id = auth.uid() AND user_id = tastings.user_id)
        )
      )
    )
  );
