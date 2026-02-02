import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

const { data } = await supabase
  .from('matches')
  .select('*')
  .eq('status', 'pending')
  .order('kickoff')

console.log('Pending matches:\n')
data.slice(0, 10).forEach(m => {
  console.log(`${m.kickoff} | ${m.home} vs ${m.away} | ${m.league}`)
})
