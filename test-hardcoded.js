import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://jtxpmlajhrkasfphuucm.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0eHBtbGFqaHJrYXNmcGh1dWNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MTc5MzgsImV4cCI6MjA4NTI5MzkzOH0.dMvfwmwk4JC1Z_qxIxr45cDdZOHl2xO8FaQlZVklO_M'

console.log('Testing with hardcoded credentials...\n')

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const { data, error, count } = await supabase
  .from('matches')
  .select('*', { count: 'exact' })

console.log('Count:', count)
console.log('Data rows:', data?.length)
console.log('Error:', error)

if (data && data.length > 0) {
  console.log('\nFirst match:', data[0])
}
