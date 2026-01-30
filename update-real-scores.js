import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

console.log('🔧 Updating completed matches with REAL scores...\n')

// Update with real scores from SofaScore
const updates = [
  { home: 'Al Qanah', score: '2-1', result: 'won' },  // 1X prediction, home won = WON
  { home: 'H. Akko', score: '1-5', result: 'won' },  // X2 prediction, away won = WON
  { home: 'Stoke City U21', score: '1-6', result: 'won' },  // X2 prediction, away won = WON
  { home: 'CFR Cluj', score: '4-2', result: 'won' }  // 1X prediction, home won = WON
]

for (const match of updates) {
  await supabase
    .from('matches')
    .update({ 
      final_score: match.score,
      result: match.result,
      status: 'completed'
    })
    .ilike('home', `%${match.home}%`)
  
  console.log(`✅ ${match.home}: ${match.score} - ${match.result.toUpperCase()}`)
}

console.log('\n✅ All matches updated with REAL scores!')
