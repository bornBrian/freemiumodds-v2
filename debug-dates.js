import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jtxpmlajhrkasfphuucm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0eHBtbGFqaHJrYXNmcGh1dWNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MTc5MzgsImV4cCI6MjA4NTI5MzkzOH0.dMvfwmwk4JC1Z_qxIxr45cDdZOHl2xO8FaQlZVklO_M'
)

const today = new Date().toISOString().split('T')[0]
console.log('Today:', today)
console.log('Looking for matches >= ', `${today}T00:00:00Z`)

const { data, error } = await supabase
  .from('matches')
  .select('home, kickoff, status')
  .limit(3)

console.log('\nSample matches:')
console.log(data)
console.log('\nError:', error)

process.exit(0)
