import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

const { data } = await supabase.from('matches').select('*').order('kickoff')

console.log('\n📊 All matches with DETAILED info:\n')

data.forEach(m => {
  const kickoff = new Date(m.kickoff)
  const now = new Date()
  const hoursSince = (now - kickoff) / (1000 * 60 * 60)
  
  console.log(`\n${m.home} vs ${m.away}`)
  console.log(`  Date: ${kickoff.toLocaleDateString()}`)
  console.log(`  Time: ${kickoff.toLocaleTimeString()}`)
  console.log(`  Kickoff ISO: ${m.kickoff}`)
  console.log(`  Hours since: ${hoursSince.toFixed(1)}`)
  console.log(`  Status: ${m.status}`)
  console.log(`  Result: ${m.result || 'none'}`)
  console.log(`  Score: ${m.final_score || 'none'}`)
  console.log(`  Should be completed: ${hoursSince > 2 ? 'YES' : 'NO'}`)
})
