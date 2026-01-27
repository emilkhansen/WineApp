-- Migration: Simplify Wine Model
-- Run this in Supabase SQL editor before deploying the application changes

-- Add new columns
ALTER TABLE wines ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE wines ADD COLUMN IF NOT EXISTS color TEXT;

-- Rename columns (grape_variety -> grape, bottle_size -> size)
ALTER TABLE wines RENAME COLUMN grape_variety TO grape;
ALTER TABLE wines RENAME COLUMN bottle_size TO size;

-- Remove unused columns
ALTER TABLE wines DROP COLUMN IF EXISTS alcohol_percentage;
ALTER TABLE wines DROP COLUMN IF EXISTS importer;
ALTER TABLE wines DROP COLUMN IF EXISTS winemaker_notes;
ALTER TABLE wines DROP COLUMN IF EXISTS is_public;
