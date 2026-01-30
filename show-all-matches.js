import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

const { data, error } = await supabase
  .from('matches')
  .select('*')
  .order('kickoff', { ascending: true })

if (error) {
  console.error('❌ Error:', error)
  process.exit(1)
}

console.log('\n📊 ALL MATCHES IN DATABASE\n')
console.log('═'.repeat(80))

if (!data || data.length === 0) {
  console.log('⚠️  Database is empty\n')
  process.exit(0)
}

for (const match of data) {
  const time = new Date(match.kickoff).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  const status = match.status === 'completed' ? `✅ ${match.final_score || 'N/A'} - ${match.result?.toUpperCase() || 'N/A'}` : '⏳ PENDING'
  
  console.log(`${status}`)
  console.log(`   ${match.home} vs ${match.away}`)
  console.log(`   ${match.league} | Kickoff: ${time}`)
  console.log(`   Tip: ${match.tip} (${match.confidence}% confidence)`)
  console.log('─'.repeat(80))
}

console.log(`\nTotal: ${data.length} matches\n`)
process.exit(0)
