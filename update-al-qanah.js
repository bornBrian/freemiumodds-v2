import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

console.log('🔍 Updating Al Qanah vs Raya with REAL score from SofaScore\n')
console.log('   SofaScore shows: Canal SC 3-0 Raya SC')
console.log('   Canal SC = Al Qanah\n')

// Al Qanah won 3-0 (prediction was 1X so it WON)
await supabase
  .from('matches')
  .update({ 
    status: 'completed', 
    result: 'won', 
    final_score: '3-0'
  })
  .ilike('home', '%Al Qanah%')

console.log('✅ Updated: Al Qanah 3-0 Raya - WON (1X)')
console.log('   SofaScore ID: 14293487')

process.exit(0)
