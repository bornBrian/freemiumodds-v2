import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jtxpmlajhrkasfphuucm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0eHBtbGFqaHJrYXNmcGh1dWNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MTc5MzgsImV4cCI6MjA4NTI5MzkzOH0.dMvfwmwk4JC1Z_qxIxr45cDdZOHl2xO8FaQlZVklO_M'
)

console.log('🔄 Resetting completed matches to pending...\n')

// Reset the 4 matches that have fake scores
const matchesToReset = [
  'Al Qanah',
  'H. Akko',
  'Stoke City U21',
  'CFR Cluj'
]

for (const team of matchesToReset) {
  await supabase
    .from('matches')
    .update({ 
      status: 'pending',
      result: null,
      final_score: null
    })
    .ilike('home', `%${team}%`)
  
  console.log(`✅ Reset ${team}`)
}

console.log('\n✅ All matches reset. Ready for SofaScore fetch.')
process.exit(0)
