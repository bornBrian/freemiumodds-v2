/**
 * Update CFR Cluj match with correct score
 */
import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

await supabase
  .from('matches')
  .update({ 
    final_score: '4-2',
    result: 'won',
    status: 'completed'
  })
  .ilike('home', '%CFR Cluj%')

console.log('✅ Updated CFR Cluj vs Metaloglobus Bucharest: 4-2 (won)')
