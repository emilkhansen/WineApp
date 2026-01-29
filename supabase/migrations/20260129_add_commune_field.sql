-- Migration: Add Commune Reference Table and Field
-- Run this in Supabase SQL editor

-- Add commune column to wines table
ALTER TABLE wines ADD COLUMN IF NOT EXISTS commune TEXT;
COMMENT ON COLUMN wines.commune IS 'Village/commune name (e.g., Pommard, Meursault, Gevrey-Chambertin)';

-- Communes reference table (linked to subregion)
CREATE TABLE IF NOT EXISTS communes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subregion_id UUID REFERENCES subregions(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, subregion_id)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_communes_subregion ON communes(subregion_id);

-- Enable RLS
ALTER TABLE communes ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read communes
CREATE POLICY "Anyone can read communes" ON communes FOR SELECT TO authenticated USING (true);

-- Only admins can insert/update/delete communes
CREATE POLICY "Admins can insert communes" ON communes FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Admins can update communes" ON communes FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Admins can delete communes" ON communes FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
