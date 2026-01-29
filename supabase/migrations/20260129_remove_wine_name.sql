-- Remove the name field from wines table
-- Wine display names are now constructed from: vintage, producer, appellation, cru, vineyard
ALTER TABLE wines DROP COLUMN name;
