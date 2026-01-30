import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jtxpmlajhrkasfphuucm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0eHBtbGFqaHJrYXNmcGh1dWNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MTc5MzgsImV4cCI6MjA4NTI5MzkzOH0.dMvfwmwk4JC1Z_qxIxr45cDdZOHl2xO8FaQlZVklO_M'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('Testing with hardcoded key...\n')

const { data, error, count } = await supabase
  .from('matches')
  .select('*', { count: 'exact' })

if (error) {
  console.error('❌ Error:', error)
} else {
  console.log(`✅ Connected! Found ${count} matches`)
  if (data && data.length > 0) {
    console.log('\nMatches:')
    data.forEach(m => console.log(`  - ${m.home} vs ${m.away}`))
  }
}

process.exit(0)
