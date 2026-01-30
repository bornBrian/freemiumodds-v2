import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jtxpmlajhrkasfphuucm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0eHBtbGFqaHJrYXNmcGh1dWNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MTc5MzgsImV4cCI6MjA4NTI5MzkzOH0.dMvfwmwk4JC1Z_qxIxr45cDdZOHl2xO8FaQlZVklO_M'
)

const { data } = await supabase
  .from('matches')
  .select('home, away, kickoff, status, result, final_score')
  .order('kickoff')

console.log('\n📊 ALL MATCHES:\n')
data.forEach((m, i) => {
  const time = new Date(m.kickoff).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  const statusIcon = m.status === 'completed' ? '✅' : '⏳'
  const score = m.final_score || '?-?'
  const result = m.result || 'pending'
  console.log(`${i+1}. ${statusIcon} ${m.home} vs ${m.away} | ${time} | ${score} (${result})`)
})

process.exit(0)
