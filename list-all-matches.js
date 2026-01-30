import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

const { data } = await supabase.from('matches').select('*').order('kickoff')

console.log('\nAll 15 matches grouped by date:\n')

const byDate = {}
data.forEach(m => {
  const date = new Date(m.kickoff).toISOString().split('T')[0]
  if (!byDate[date]) byDate[date] = []
  byDate[date].push(m)
})

Object.entries(byDate).forEach(([date, matches]) => {
  console.log(`📅 ${date}: ${matches.length} matches`)
  matches.forEach(m => {
    const time = new Date(m.kickoff).toLocaleTimeString()
    const status = m.result ? `${m.status} - ${m.result}` : m.status
    console.log(`   ${time} - ${m.home} vs ${m.away} [${status}]`)
  })
  console.log('')
})
