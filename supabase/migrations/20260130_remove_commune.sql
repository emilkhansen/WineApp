-- Remove commune column from wines table
ALTER TABLE wines DROP COLUMN IF EXISTS commune;

-- Drop communes table and related objects
DROP TABLE IF EXISTS communes CASCADE;
