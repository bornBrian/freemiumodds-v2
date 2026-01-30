import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jtxpmlajhrkasfphuucm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0eHBtbGFqaHJrYXNmcGh1dWNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MTc5MzgsImV4cCI6MjA4NTI5MzkzOH0.dMvfwmwk4JC1Z_qxIxr45cDdZOHl2xO8FaQlZVklO_M'
)

const { data } = await supabase
  .from('matches')
  .select('*')
  .order('kickoff')

console.log('\n📊 ALL MATCHES WITH TIMES:\n')

const now = new Date()
console.log(`Current time: ${now.toISOString()}\n`)

data.forEach((m, i) => {
  const kickoff = new Date(m.kickoff)
  const diffMinutes = Math.floor((now - kickoff) / (1000 * 60))
  const timeStr = kickoff.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  const hasStarted = diffMinutes > 0
  const shouldBeFinished = diffMinutes > 120 // 2 hours
  
  console.log(`${i+1}. ${m.home} vs ${m.away}`)
  console.log(`   Kickoff: ${timeStr} (${diffMinutes > 0 ? diffMinutes + ' mins ago' : 'in ' + Math.abs(diffMinutes) + ' mins'})`)
  console.log(`   Status: ${hasStarted ? '🟢 STARTED' : '⚪ NOT STARTED'} ${shouldBeFinished ? '✅ Should be finished' : ''}`)
  console.log(`   DB Status: ${m.status} | Result: ${m.result || 'N/A'} | Score: ${m.final_score || 'N/A'}`)
  console.log('')
})

process.exit(0)
