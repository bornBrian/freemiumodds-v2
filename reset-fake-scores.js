import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jtxpmlajhrkasfphuucm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0eHBtbGFqaHJrYXNmcGh1dWNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MTc5MzgsImV4cCI6MjA4NTI5MzkzOH0.dMvfwmwk4JC1Z_qxIxr45cDdZOHl2xO8FaQlZVklO_M'
)

console.log('🔄 Resetting fake scores for matches that havent started...\n')

// Reset Real Madrid B (just started)
await supabase
  .from('matches')
  .update({ status: 'pending', result: null, final_score: null })
  .ilike('home', '%Real Madrid B%')

console.log('✅ Reset Real Madrid B')

// Reset Arbroath (not started yet)
await supabase
  .from('matches')
  .update({ status: 'pending', result: null, final_score: null })
  .ilike('home', '%Arbroath%')

console.log('✅ Reset Arbroath')

console.log('\n✅ Done. Only keeping results for matches that actually finished.')
process.exit(0)
