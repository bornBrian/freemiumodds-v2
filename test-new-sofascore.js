/**
 * Test the NEW SofaScore implementation with real pending matches
 */
import { createClient } from '@supabase/supabase-js'
import { fetchMatchResult } from './api/services/multiApiResults.js'
import 'dotenv/config'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

console.log('🧪 Testing NEW SofaScore Integration\n')

// Get some pending matches from Jan 31st
const { data: matches } = await supabase
  .from('matches')
  .select('*')
  .eq('status', 'pending')
  .like('kickoff', '2026-01-31%')
  .limit(5)

if (!matches || matches.length === 0) {
  console.log('No pending matches from Jan 31st found')
  process.exit(0)
}

console.log(`Testing with ${matches.length} matches:\n`)

let successCount = 0

for (const match of matches) {
  console.log(`\n${'='.repeat(70)}`)
  console.log(`🏆 ${match.home} vs ${match.away}`)
  console.log(`   League: ${match.league}`)
  console.log(`   Kickoff: ${new Date(match.kickoff).toLocaleString()}`)
  console.log(`   Prediction: ${match.tip} (${match.confidence}%)`)
  console.log('='.repeat(70))
  
  try {
    const result = await fetchMatchResult(match, {})
    
    if (result) {
      successCount++
      const finalScore = `${result.homeScore}-${result.awayScore}`
      
      // Check if prediction won
      const tip = match.tip || match.best_pick
      let predictionResult = 'lost'
      
      if (tip === '1X' && result.homeScore >= result.awayScore) predictionResult = 'won'
      else if (tip === 'X2' && result.awayScore >= result.homeScore) predictionResult = 'won'
      else if (tip === '12' && result.homeScore !== result.awayScore) predictionResult = 'won'
      else if (tip === '1' && result.homeScore > result.awayScore) predictionResult = 'won'
      else if (tip === 'X' && result.homeScore === result.awayScore) predictionResult = 'won'
      else if (tip === '2' && result.awayScore > result.homeScore) predictionResult = 'won'
      
      const emoji = predictionResult === 'won' ? '✅' : '❌'
      console.log(`\n   ${emoji} FINAL SCORE: ${finalScore}`)
      console.log(`   Prediction: ${predictionResult.toUpperCase()}`)
    } else {
      console.log('\n   ❌ No result found')
    }
    
  } catch (error) {
    console.log(`\n   ❌ Error: ${error.message}`)
  }
  
  // Small delay between requests
  await new Promise(resolve => setTimeout(resolve, 1500))
}

console.log(`\n\n${'='.repeat(70)}`)
console.log(`📊 RESULTS: ${successCount}/${matches.length} matches found`)
console.log('='.repeat(70))

if (successCount === matches.length) {
  console.log('\n🎉 SUCCESS! All matches found with new SofaScore implementation!')
} else if (successCount > 0) {
  console.log(`\n✅ Partial success - ${successCount} matches found`)
} else {
  console.log('\n❌ No matches found - needs debugging')
}
