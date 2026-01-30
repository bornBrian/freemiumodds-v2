-- Add new columns for Oddslot integration

-- Add oddslot_prediction column (stores original '1', 'X', or '2')
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS oddslot_prediction VARCHAR(5);

-- Add actual_result column (stores final match result '1', 'X', or '2')
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS actual_result VARCHAR(5);

-- Update confidence to allow NULL (when using fallback method)
ALTER TABLE matches 
ALTER COLUMN confidence DROP NOT NULL;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_matches_status_kickoff 
ON matches(status, kickoff);

CREATE INDEX IF NOT EXISTS idx_matches_confidence 
ON matches(confidence DESC) 
WHERE confidence >= 84;

COMMENT ON COLUMN matches.oddslot_prediction IS 'Original prediction from Oddslot: 1 (home), X (draw), 2 (away)';
COMMENT ON COLUMN matches.actual_result IS 'Actual match result: 1 (home win), X (draw), 2 (away win)';
COMMENT ON COLUMN matches.tip IS 'Double chance tip converted from oddslot_prediction: 1X, X2, or 12';
