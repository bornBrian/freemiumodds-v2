/**
 * Update matches with REAL scores from SofaScore
 */
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

console.log('🔧 Updating with REAL scores from SofaScore...\n')

// Real scores verified from SofaScore API
const corrections = [
  {
    team: 'H. Akko',
    opponent: 'Maccabi Petah Tikva',
    correctScore: '1-5',
    result: 'LOST'
  },
  {
    team: 'Stoke City U21',
    opponent: 'Manchester City U21', 
    correctScore: '1-6',
    result: 'LOST'
  }
]

for (const match of corrections) {
  console.log(`Updating ${match.team} vs ${match.opponent}...`)
  
  const { data, error } = await supabase
    .from('matches')
    .update({
      final_score: match.correctScore,
      result: match.result
    })
    .or(`home_team.eq.${match.team},away_team.eq.${match.team}`)
    .or(`home_team.eq.${match.opponent},away_team.eq.${match.opponent}`)
  
  if (error) {
    console.error(`   ❌ Error: ${error.message}`)
  } else {
    console.log(`   ✅ Updated to ${match.correctScore} - ${match.result}`)
  }
}

console.log('\n✅ Database updated with REAL scores from SofaScore!')
