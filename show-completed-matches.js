import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

console.log('📊 COMPLETED MATCHES WITH REAL RESULTS\n')
console.log('=' .repeat(70))

const { data: completed } = await supabase
  .from('matches')
  .select('*')
  .eq('status', 'completed')
  .order('kickoff')

if (!completed || completed.length === 0) {
  console.log('No completed matches yet')
  process.exit(1)
}

console.log(`\nFound ${completed.length} completed matches:\n`)

completed.forEach((m, i) => {
  const kickoff = new Date(m.kickoff)
  const emoji = m.result === 'won' ? '✅' : '❌'
  
  console.log(`${i + 1}. ${emoji} ${m.home} vs ${m.away}`)
  console.log(`   Final Score: ${m.final_score || 'Not recorded'}`)
  console.log(`   League: ${m.league}`)
  console.log(`   Kickoff: ${kickoff.toLocaleString()}`)
  console.log(`   Prediction: ${m.tip} (${m.confidence}% confidence)`)
  console.log(`   Result: ${m.result?.toUpperCase()}`)
  console.log(`   SofaScore Verify: https://www.sofascore.com/`)
  console.log('')
})

const won = completed.filter(m => m.result === 'won').length
const lost = completed.filter(m => m.result === 'lost').length
const winRate = Math.round((won / completed.length) * 100)

console.log('=' .repeat(70))
console.log(`\n📈 STATISTICS:`)
console.log(`   Total Completed: ${completed.length}`)
console.log(`   Won: ${won} ✅`)
console.log(`   Lost: ${lost} ❌`)
console.log(`   Win Rate: ${winRate}%`)
console.log(`\n✅ All scores can be verified on SofaScore.com`)
