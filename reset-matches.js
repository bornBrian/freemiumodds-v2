import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

console.log('🔄 Resetting matches to pending to fetch real results...\n')

// Reset all completed matches back to pending so we can fetch real results
const { data: matches } = await supabase
  .from('matches')
  .update({
    status: 'pending',
    result: null,
    final_score: null
  })
  .eq('status', 'completed')
  .select()

console.log(`✅ Reset ${matches?.length || 0} matches back to pending`)
console.log('\nNow run: node fetch-real-results.js')
