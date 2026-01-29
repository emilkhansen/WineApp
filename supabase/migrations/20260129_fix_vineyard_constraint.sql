-- Fix vineyard unique constraint to allow same vineyard names in different appellations
-- Problem: In Burgundy, many vineyard names exist in multiple appellations within the same region
-- Examples: "Les Cras" (Chambolle-Musigny, Beaune, Meursault), "Les Charmes" (Chambolle-Musigny, Meursault)

-- Drop the existing constraint that only considers name + region_id
ALTER TABLE vineyards DROP CONSTRAINT vineyards_name_region_id_key;

-- Add new constraint that includes appellation_id
-- This allows the same vineyard name to exist in different appellations within the same region
ALTER TABLE vineyards ADD CONSTRAINT vineyards_name_region_appellation_key
  UNIQUE(name, region_id, appellation_id);
