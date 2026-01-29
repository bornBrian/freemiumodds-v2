-- FreemiumOdds V2 - Supabase Database Schema
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_match_id VARCHAR(255) UNIQUE NOT NULL,
  home VARCHAR(255) NOT NULL,
  away VARCHAR(255) NOT NULL,
  league VARCHAR(255) NOT NULL,
  kickoff TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  confidence INTEGER DEFAULT 84,
  tip VARCHAR(50),
  double_chance JSONB NOT NULL,
  bookmaker VARCHAR(100),
  final_score VARCHAR(20),
  result VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_matches_kickoff ON matches(kickoff);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_provider_id ON matches(provider_match_id);
CREATE INDEX idx_matches_date ON matches(DATE(kickoff));

-- Oddslot tips table (optional, for storing Oddslot data separately)
CREATE TABLE IF NOT EXISTS oddslot_tips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  confidence INTEGER NOT NULL CHECK (confidence >= 84 AND confidence <= 100),
  tip_type VARCHAR(50),
  tip_detail TEXT,
  source VARCHAR(100) DEFAULT 'oddslot',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tips_match_id ON oddslot_tips(match_id);
CREATE INDEX idx_tips_confidence ON oddslot_tips(confidence);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event VARCHAR(100) NOT NULL,
  payload JSONB,
  status VARCHAR(50),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_logs_event ON audit_logs(event);
CREATE INDEX idx_logs_created ON audit_logs(created_at);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to matches table
CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Sample data (for testing)
INSERT INTO matches (
  provider_match_id, home, away, league, kickoff, confidence, tip, double_chance, bookmaker
) VALUES 
(
  'test_match_1',
  'Manchester United',
  'Liverpool',
  'English Premier League',
  NOW() + INTERVAL '2 hours',
  87,
  '1X',
  '{"1X": 1.45, "X2": 1.32, "12": 1.18}'::jsonb,
  'bet365'
),
(
  'test_match_2',
  'Real Madrid',
  'Barcelona',
  'Spanish La Liga',
  NOW() + INTERVAL '4 hours',
  91,
  '12',
  '{"1X": 1.28, "X2": 1.22, "12": 1.35}'::jsonb,
  'bet365'
)
ON CONFLICT (provider_match_id) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE oddslot_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Public read access policy
CREATE POLICY "Allow public read access" ON matches
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON oddslot_tips
  FOR SELECT USING (true);

-- Admin write policies (you'll need to configure admin users separately)
CREATE POLICY "Allow authenticated write" ON matches
  FOR ALL USING (auth.role() = 'authenticated');

-- View for today's matches
CREATE OR REPLACE VIEW todays_matches AS
SELECT * FROM matches
WHERE DATE(kickoff) = CURRENT_DATE
ORDER BY kickoff ASC;

-- View for upcoming matches (next 7 days)
CREATE OR REPLACE VIEW upcoming_matches AS
SELECT * FROM matches
WHERE kickoff BETWEEN NOW() AND NOW() + INTERVAL '7 days'
ORDER BY kickoff ASC;

-- Function to get match stats
CREATE OR REPLACE FUNCTION get_match_stats(date_param DATE DEFAULT CURRENT_DATE)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total', COUNT(*),
    'pending', COUNT(*) FILTER (WHERE status = 'pending'),
    'live', COUNT(*) FILTER (WHERE status = 'live'),
    'completed', COUNT(*) FILTER (WHERE status = 'completed'),
    'avg_confidence', ROUND(AVG(confidence), 2)
  )
  INTO result
  FROM matches
  WHERE DATE(kickoff) = date_param;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ FreemiumOdds V2 database schema created successfully!';
  RAISE NOTICE '📊 Tables: matches, oddslot_tips, audit_logs';
  RAISE NOTICE '🔍 Views: todays_matches, upcoming_matches';
END $$;
