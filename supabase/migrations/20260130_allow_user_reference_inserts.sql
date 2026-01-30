-- Allow authenticated users to insert reference data
-- This enables auto-creation of reference entries when users enter custom values

CREATE POLICY "Users can insert producers" ON producers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can insert grape_varieties" ON grape_varieties FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can insert regions" ON regions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can insert subregions" ON subregions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can insert cru_classifications" ON cru_classifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can insert appellations" ON appellations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can insert vineyards" ON vineyards FOR INSERT TO authenticated WITH CHECK (true);
