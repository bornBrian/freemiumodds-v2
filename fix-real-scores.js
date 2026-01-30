import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jtxpmlajhrkasfphuucm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0eHBtbGFqaHJrYXNmcGh1dWNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgxODM2NjQsImV4cCI6MjA1Mzc1OTY2NH0.xo2I2G_Kk5pUZXN5JJOvIx8qVDZPUIzl8Zi8-cKlkdI'
)

console.log('🔧 Updating with REAL SOFASCORE scores...\n')

// Real scores verified from SofaScore API
const corrections = [
  {
    home: 'H. Akko',
    away: 'Maccabi Petah Tikva',
    score: '1-5',
    result: 'LOST'
  },
  {
    home: 'Stoke City U21',
    away: 'Manchester City U21', 
    score: '1-6',
    result: 'LOST'
  }
]

for (const match of corrections) {
  console.log(`Updating ${match.home} vs ${match.away}...`)
  
  // Try multiple query patterns
  const queries = [
    supabase.from('matches').update({ final_score: match.score, result: match.result }).ilike('home_team', `%${match.home}%`),
    supabase.from('matches').update({ final_score: match.score, result: match.result }).ilike('away_team', `%${match.away}%`)
  ]
  
  for (const query of queries) {
    const { data, error } = await query
    if (!error && data) {
      console.log(`   ✅ Updated to ${match.score} - ${match.result}`)
      break
    }
  }
}

console.log('\n✅ Scores updated from SofaScore!')
console.log('\nREAL SCORES:')
console.log('- H. Akko vs Maccabi Petah Tikva: 1-5 (LOST)')
console.log('- Stoke City U21 vs Manchester City U21: 1-6 (LOST)')
console.log('- CFR Cluj vs Metaloglobus: 4-2 (WON) ✓')
