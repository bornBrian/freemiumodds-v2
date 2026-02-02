/**
 * Update all old pending matches with REAL results from SofaScore
 */
import { createClient } from '@supabase/supabase-js'
import { fetchMatchResult } from './api/services/multiApiResults.js'
import 'dotenv/config'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

console.log('🔄 Updating ALL old pending matches with REAL SofaScore results...\n')

// Get all matches that should be finished (older than 3 hours)
const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
const { data: matches } = await supabase
  .from('matches')
  .select('*')
  .eq('status', 'pending')
  .lt('kickoff', threeHoursAgo)
  .order('kickoff', { ascending: true })

if (!matches || matches.length === 0) {
  console.log('✅ No old pending matches to update')
  process.exit(0)
}

console.log(`📊 Found ${matches.length} old pending matches\n`)

let updated = 0
let notFound = 0
let won = 0
let lost = 0

for (const match of matches) {
  const kickoffDate = new Date(match.kickoff).toLocaleString()
  console.log(`\n${updated + notFound + 1}/${matches.length}: ${match.home} vs ${match.away}`)
  console.log(`   Kickoff: ${kickoffDate}`)
  console.log(`   League: ${match.league}`)
  console.log(`   Prediction: ${match.tip} (${match.confidence}%)`)
  
  try {
    const result = await fetchMatchResult(match, {})
    
    if (result) {
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
      
      // Update database
      await supabase
        .from('matches')
        .update({
          status: 'completed',
          result: predictionResult,
          final_score: finalScore,
          updated_at: new Date().toISOString()
        })
        .eq('id', match.id)
      
      updated++
      if (predictionResult === 'won') won++
      else lost++
      
      const emoji = predictionResult === 'won' ? '✅' : '❌'
      console.log(`   ${emoji} ${finalScore} - ${predictionResult.toUpperCase()}`)
    } else {
      notFound++
      console.log(`   ⚠️  No result found (likely future match or too obscure)`)
    }
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`)
    notFound++
  }
  
  // Small delay to avoid rate limiting
  await new Promise(resolve => setTimeout(resolve, 1500))
}

console.log(`\n\n${'='.repeat(70)}`)
console.log(`📊 FINAL RESULTS:`)
console.log(`   Total processed: ${matches.length}`)
console.log(`   Updated with results: ${updated}`)
console.log(`   Not found: ${notFound}`)
console.log(`   Predictions won: ${won}`)
console.log(`   Predictions lost: ${lost}`)
if (updated > 0) {
  console.log(`   Win Rate: ${Math.round((won / updated) * 100)}%`)
}
console.log('='.repeat(70))
console.log('\n✅ All old matches updated with REAL data from SofaScore!')
