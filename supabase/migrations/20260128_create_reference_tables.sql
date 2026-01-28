-- Reference Tables for Wine Data Management
-- These tables store lookup/reference data for wine metadata

-- Colors (system-managed)
CREATE TABLE colors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grape Varieties (system-managed)
CREATE TABLE grape_varieties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  color TEXT,  -- 'red', 'white', 'rosé', 'sparkling', etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Regions (system-managed)
CREATE TABLE regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  country TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subregions (system-managed, linked to region)
CREATE TABLE subregions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  region_id UUID REFERENCES regions(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, region_id)
);

-- Cru Classifications (system-managed)
CREATE TABLE cru_classifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  region_id UUID REFERENCES regions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appellations (admin-managed)
CREATE TABLE appellations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  region_id UUID REFERENCES regions(id) ON DELETE SET NULL,
  subregion_id UUID REFERENCES subregions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, region_id)
);

-- Producers (admin-managed)
CREATE TABLE producers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  region_id UUID REFERENCES regions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vineyards (admin-managed)
CREATE TABLE vineyards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  region_id UUID REFERENCES regions(id) ON DELETE SET NULL,
  appellation_id UUID REFERENCES appellations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, region_id)
);

-- Indexes for performance
CREATE INDEX idx_subregions_region ON subregions(region_id);
CREATE INDEX idx_appellations_region ON appellations(region_id);
CREATE INDEX idx_appellations_subregion ON appellations(subregion_id);
CREATE INDEX idx_vineyards_region ON vineyards(region_id);
CREATE INDEX idx_vineyards_appellation ON vineyards(appellation_id);
CREATE INDEX idx_cru_region ON cru_classifications(region_id);
CREATE INDEX idx_grape_color ON grape_varieties(color);

-- Enable RLS on all reference tables (admins only can modify)
ALTER TABLE colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE grape_varieties ENABLE ROW LEVEL SECURITY;
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subregions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cru_classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE appellations ENABLE ROW LEVEL SECURITY;
ALTER TABLE producers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vineyards ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read reference data
CREATE POLICY "Anyone can read colors" ON colors FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can read grape_varieties" ON grape_varieties FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can read regions" ON regions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can read subregions" ON subregions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can read cru_classifications" ON cru_classifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can read appellations" ON appellations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can read producers" ON producers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can read vineyards" ON vineyards FOR SELECT TO authenticated USING (true);

-- Only admins can insert/update/delete reference data
-- These policies check if the user has is_admin = true in their profile
CREATE POLICY "Admins can insert colors" ON colors FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Admins can update colors" ON colors FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Admins can delete colors" ON colors FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Admins can insert grape_varieties" ON grape_varieties FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Admins can update grape_varieties" ON grape_varieties FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Admins can delete grape_varieties" ON grape_varieties FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Admins can insert regions" ON regions FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Admins can update regions" ON regions FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Admins can delete regions" ON regions FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Admins can insert subregions" ON subregions FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Admins can update subregions" ON subregions FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Admins can delete subregions" ON subregions FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Admins can insert cru_classifications" ON cru_classifications FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Admins can update cru_classifications" ON cru_classifications FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Admins can delete cru_classifications" ON cru_classifications FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Admins can insert appellations" ON appellations FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Admins can update appellations" ON appellations FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Admins can delete appellations" ON appellations FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Admins can insert producers" ON producers FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Admins can update producers" ON producers FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Admins can delete producers" ON producers FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Admins can insert vineyards" ON vineyards FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Admins can update vineyards" ON vineyards FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Admins can delete vineyards" ON vineyards FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
