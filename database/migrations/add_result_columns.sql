-- Add missing columns for match results
-- Run this in Supabase SQL Editor

ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS final_score VARCHAR(20),
ADD COLUMN IF NOT EXISTS result VARCHAR(50);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_matches_result ON matches(result);

-- Update comment
COMMENT ON COLUMN matches.result IS 'Match result: won, lost, or NULL if pending';
COMMENT ON COLUMN matches.final_score IS 'Final score like 2-1';
