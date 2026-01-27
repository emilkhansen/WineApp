-- Migration: Add Cru Field
-- Run this in Supabase SQL editor

-- Add cru column to wines table
ALTER TABLE wines ADD COLUMN IF NOT EXISTS cru TEXT;

-- Add comment for documentation
COMMENT ON COLUMN wines.cru IS 'Wine classification (Grand Cru, Premier Cru, etc.)';
