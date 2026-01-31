/**
 * AUTO-FETCH REAL results from MULTIPLE APIs
 * Uses multi-API fallback for maximum reliability
 */
import { createClient } from '@supabase/supabase-js'
import { fetchMatchResult } from './api/services/multiApiResults.js'
import 'dotenv/config'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

// API Keys from environment
const apiKeys = {
  rapidapi: process.env.RAPIDAPI_KEY || 'fec633af79mshf7000f109cc0255p1b5e39jsn10b0eb338982',
  footballData: process.env.FOOTBALL_DATA_ORG_KEY || '499d44325a7e48968f5dc9bd62541e7d',
  apiFootball: process.env.API_FOOTBALL_KEY || '6f965235007cf99bbfdebd076f78683d'
}

console.log('🔄 AUTO-FETCHING REAL results from MULTIPLE APIs...')
console.log('📡 Using: SofaScore, football-data.org, API-Football\n')

// Get pending matches that should be finished (2+ hours after kickoff)
const twoHoursAgo = new Date(Date.now() - 120 * 60 * 1000).toISOString()
const { data: matches } = await supabase
  .from('matches')
  .select('*')
  .eq('status', 'pending')
  .lt('kickoff', twoHoursAgo)

console.log(`Found ${matches?.length || 0} matches that should be finished`)

if (!matches || matches.length === 0) {
  console.log('✅ No matches need updating')
  process.exit(0)
}

console.log(`📊 Found ${matches.length} matches to update\n`)

let updated = 0
let won = 0
let lost = 0

for (const match of matches) {
  console.log(`\n🔍 ${match.home} vs ${match.away}`)
  
  try {
    // Use multi-API fetcher
    const result = await fetchMatchResult(match, apiKeys)
    
    if (result) {
      const finalScore = `${result.homeScore}-${result.awayScore}`
      
      // Validate prediction
      const tip = match.tip || match.best_pick
      let predictionResult = 'lost'
      
      if (tip === '1X' && result.homeScore >= result.awayScore) predictionResult = 'won'
      else if (tip === 'X2' && result.awayScore >= result.homeScore) predictionResult = 'won'
      else if (tip === '12' && result.homeScore !== result.awayScore) predictionResult = 'won'
      
      // Update database
      await supabase
        .from('matches')
        .update({
          status: 'completed',
          result: predictionResult,
          final_score: finalScore
        })
        .eq('id', match.id)
      
      updated++
      if (predictionResult === 'won') won++
      else lost++
      
      const emoji = predictionResult === 'won' ? '✅' : '❌'
      console.log(`   ${emoji} ${result.source}: ${finalScore} - ${predictionResult.toUpperCase()}`)
    } else {
      console.log(`   ⚠️  Not found in any API`)
    }
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`)
  }
  
  // Delay to avoid rate limiting
  await new Promise(resolve => setTimeout(resolve, 1000))
}

console.log(`\n\n📊 Summary:`)
console.log(`   Updated: ${updated} matches`)
console.log(`   Won: ${won}`)
console.log(`   Lost: ${lost}`)
if (updated > 0) {
  console.log(`   Win Rate: ${Math.round((won / updated) * 100)}%`)
}
console.log(`\n✅ MULTI-API FETCH complete - maximum reliability!`)

process.exit(0)

console.log(`\n\n📊 Summary:`)
console.log(`   Updated: ${updated} matches`)
console.log(`   Won: ${won}`)
console.log(`   Lost: ${lost}`)
if (updated > 0) {
  console.log(`   Win Rate: ${Math.round((won / updated) * 100)}%`)
}
console.log(`\n✅ MULTI-API FETCH complete - maximum reliability!`)

process.exit(0)
