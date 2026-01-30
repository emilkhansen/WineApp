-- Remove "AOC" from all appellation names in the reference table
-- Handles: "AOC Bordeaux", "Bordeaux AOC", "Saint-Émilion Grand Cru AOC"

UPDATE appellations
SET name = TRIM(REPLACE(REPLACE(name, 'AOC ', ''), ' AOC', ''))
WHERE name ILIKE '%AOC%';
