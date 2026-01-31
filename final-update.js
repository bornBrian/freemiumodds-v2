import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jtxpmlajhrkasfphuucm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0eHBtbGFqaHJrYXNmcGh1dWNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MTc5MzgsImV4cCI6MjA4NTI5MzkzOH0.dMvfwmwk4JC1Z_qxIxr45cDdZOHl2xO8FaQlZVklO_M'
)

console.log('✅ Updating Al Qanah: 3-0 WON\n')

await supabase
  .from('matches')
  .update({ status: 'completed', result: 'won', final_score: '3-0' })
  .ilike('home', '%Al Qanah%')

const { data } = await supabase
  .from('matches')
  .select('home, away, status, result, final_score')
  .order('kickoff')

console.log('📊 ALL RESULTS:\n')
data.forEach((m, i) => {
  const icon = m.status === 'completed' ? (m.result === 'won' ? '✅' : '❌') : '⏳'
  const score = m.final_score || '?-?'
  const result = m.result || 'pending'
  console.log(`${i+1}. ${icon} ${m.home} vs ${m.away}: ${score} (${result})`)
})

process.exit(0)
