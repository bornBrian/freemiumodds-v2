import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

const { data, error } = await supabase
  .from('matches')
  .select('*')
  .ilike('home', '%Al Qanah%')
  .single()

if (error) {
  console.log('Error:', error)
} else {
  console.log('Al Qanah match:')
  console.log(`  Home: ${data.home}`)
  console.log(`  Away: ${data.away}`)
  console.log(`  Status: ${data.status}`)
  console.log(`  Result: ${data.result}`)
  console.log(`  Score: ${data.final_score}`)
}

process.exit(0)
