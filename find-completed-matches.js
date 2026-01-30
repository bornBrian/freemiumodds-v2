import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

console.log('🔍 Finding completed matches...\n')

const { data: matches, error } = await supabase
  .from('matches')
  .select('*')
  .eq('status', 'completed')

if (error) {
  console.error('Error:', error)
} else {
  console.log(`Found ${matches.length} completed matches:\n`)
  matches.forEach((m, i) => {
    console.log(`${i+1}. ${m.home_team} vs ${m.away_team}`)
    console.log(`   ID: ${m.id}`)
    console.log(`   Score: ${m.final_score}`)
    console.log(`   Result: ${m.result}`)
    console.log(`   League: ${m.league}\n`)
  })
}
