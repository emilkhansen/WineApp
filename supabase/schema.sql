-- WineApp Database Schema
-- Run this in your Supabase SQL Editor

-- Wines table
CREATE TABLE IF NOT EXISTS wines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  producer TEXT,
  vintage INTEGER,
  region TEXT,
  grape_variety TEXT,
  alcohol_percentage DECIMAL(4,2),
  bottle_size TEXT,
  appellation TEXT,
  importer TEXT,
  vineyard TEXT,
  winemaker_notes TEXT,
  image_url TEXT,
  stock INTEGER DEFAULT 1 NOT NULL,
  is_public BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Tastings table
CREATE TABLE IF NOT EXISTS tastings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wine_id UUID REFERENCES wines(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  notes TEXT,
  tasting_date DATE NOT NULL,
  location TEXT,
  occasion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE wines ENABLE ROW LEVEL SECURITY;
ALTER TABLE tastings ENABLE ROW LEVEL SECURITY;

-- Wines RLS Policies
CREATE POLICY "Users can view own wines" ON wines
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wines" ON wines
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wines" ON wines
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own wines" ON wines
  FOR DELETE USING (auth.uid() = user_id);

-- Tastings RLS Policies
CREATE POLICY "Users can view own tastings" ON tastings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tastings" ON tastings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tastings" ON tastings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tastings" ON tastings
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to wines table
DROP TRIGGER IF EXISTS wines_updated_at ON wines;
CREATE TRIGGER wines_updated_at
  BEFORE UPDATE ON wines
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_wines_user_id ON wines(user_id);
CREATE INDEX IF NOT EXISTS idx_wines_region ON wines(region);
CREATE INDEX IF NOT EXISTS idx_wines_grape_variety ON wines(grape_variety);
CREATE INDEX IF NOT EXISTS idx_tastings_user_id ON tastings(user_id);
CREATE INDEX IF NOT EXISTS idx_tastings_wine_id ON tastings(wine_id);
CREATE INDEX IF NOT EXISTS idx_tastings_tasting_date ON tastings(tasting_date);

-- Storage bucket for wine label images
-- Note: Run this in the Supabase Dashboard under Storage, or use:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('wine-labels', 'wine-labels', true);
