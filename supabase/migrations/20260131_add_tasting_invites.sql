-- Table to store pending tasting invites for users who haven't signed up yet
-- When they sign up, they'll be linked to the tasting

CREATE TABLE tasting_invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tasting_id UUID NOT NULL REFERENCES tastings(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  invited_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  claimed_at TIMESTAMPTZ,
  claimed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Prevent duplicate invites for same tasting/email
  UNIQUE(tasting_id, email)
);

-- Index for looking up invites by email (for when users sign up)
CREATE INDEX idx_tasting_invites_email ON tasting_invites(email) WHERE claimed_at IS NULL;

-- Index for looking up invites by tasting
CREATE INDEX idx_tasting_invites_tasting_id ON tasting_invites(tasting_id);

-- RLS policies
ALTER TABLE tasting_invites ENABLE ROW LEVEL SECURITY;

-- Users can view invites for their own tastings
CREATE POLICY "Users can view invites for their tastings"
  ON tasting_invites FOR SELECT
  USING (invited_by = auth.uid());

-- Users can create invites for their own tastings
CREATE POLICY "Users can create invites"
  ON tasting_invites FOR INSERT
  WITH CHECK (invited_by = auth.uid());

-- Users can delete their own invites
CREATE POLICY "Users can delete their own invites"
  ON tasting_invites FOR DELETE
  USING (invited_by = auth.uid());

-- Function to claim pending invites when a user signs up
CREATE OR REPLACE FUNCTION claim_tasting_invites()
RETURNS TRIGGER AS $$
DECLARE
  invite_record RECORD;
BEGIN
  -- Find and claim all pending invites for this email (using NEW.email from profiles)
  FOR invite_record IN
    SELECT ti.id, ti.tasting_id
    FROM tasting_invites ti
    WHERE ti.email = NEW.email AND ti.claimed_at IS NULL
  LOOP
    -- Mark invite as claimed
    UPDATE tasting_invites
    SET claimed_at = NOW(), claimed_by = NEW.id
    WHERE id = invite_record.id;

    -- Add user to tasting_friends if not already there
    INSERT INTO tasting_friends (tasting_id, friend_id)
    VALUES (invite_record.tasting_id, NEW.id)
    ON CONFLICT (tasting_id, friend_id) DO NOTHING;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to claim invites when a profile is created (on user signup)
CREATE TRIGGER on_profile_created_claim_invites
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION claim_tasting_invites();
