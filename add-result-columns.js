/**
 * Add result columns to matches table
 * Run: node add-result-columns.js
 */

import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

console.log('🔧 Adding result columns to matches table...\n')
console.log('📋 SQL to run in Supabase SQL Editor:')
console.log('─'.repeat(60))
console.log(`
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS final_score VARCHAR(20),
ADD COLUMN IF NOT EXISTS result VARCHAR(50);

CREATE INDEX IF NOT EXISTS idx_matches_result ON matches(result);
`)
console.log('─'.repeat(60))
console.log('\n📍 Go to: ' + process.env.SUPABASE_URL.replace('.supabase.co', '.supabase.co/project/_/sql'))
console.log('\n✅ After running the SQL, run: node update-match-results.js')
