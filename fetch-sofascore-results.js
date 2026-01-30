/**
 * Fetch REAL results from SofaScore API
 * SofaScore has comprehensive free data for all matches
 */
import { createClient } from '@supabase/supabase-js'
import fetch from 'node-fetch'
import 'dotenv/config'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

console.log('🔄 Fetching REAL results from SofaScore...\n')

// Get matches that need updating
const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
const { data: matches } = await supabase
  .from('matches')
  .select('*')
  .eq('status', 'pending')
  .lt('kickoff', twoHoursAgo)

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
    // Format team names for URL (lowercase, spaces to hyphens)
    const homeSlug = match.home.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const awaySlug = match.away.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    
    // Search SofaScore API
    const searchQuery = encodeURIComponent(`${match.home} ${match.away}`)
    const searchUrl = `https://www.sofascore.com/api/v1/search/all?q=${searchQuery}`
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    })
    
    if (!response.ok) {
      console.log(`   ⚠️  SofaScore API returned ${response.status}`)
      continue
    }
    
    const data = await response.json()
    
    // Find the event in results
    let foundMatch = null
    if (data.results) {
      for (const result of data.results) {
        if (result.type === 'event' && result.entity) {
          const event = result.entity
          
          // Check if team names match (fuzzy match)
          const homeMatch = event.homeTeam?.name?.toLowerCase().includes(match.home.toLowerCase().split(' ')[0]) ||
                           match.home.toLowerCase().includes(event.homeTeam?.name?.toLowerCase())
          const awayMatch = event.awayTeam?.name?.toLowerCase().includes(match.away.toLowerCase().split(' ')[0]) ||
                           match.away.toLowerCase().includes(event.awayTeam?.name?.toLowerCase())
          
          if (homeMatch && awayMatch) {
            foundMatch = event
            break
          }
        }
      }
    }
    
    if (foundMatch && foundMatch.status?.type === 'finished') {
      // Get the match details for full score
      const matchId = foundMatch.id
      const detailUrl = `https://www.sofascore.com/api/v1/event/${matchId}`
      
      const detailResponse = await fetch(detailUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json'
        }
      })
      
      if (detailResponse.ok) {
        const matchData = await detailResponse.json()
        const event = matchData.event
        
        if (event.homeScore && event.awayScore) {
          const homeScore = event.homeScore.current || event.homeScore.display
          const awayScore = event.awayScore.current || event.awayScore.display
          const finalScore = `${homeScore}-${awayScore}`
          
          // Check if prediction won
          const tip = match.tip || match.best_pick
          let predictionResult = 'lost'
          
          if (tip === '1X' && homeScore >= awayScore) predictionResult = 'won'
          else if (tip === 'X2' && awayScore >= homeScore) predictionResult = 'won'
          else if (tip === '12' && homeScore !== awayScore) predictionResult = 'won'
          
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
          console.log(`   ${emoji} REAL SCORE from SofaScore: ${finalScore} - ${predictionResult.toUpperCase()}`)
          console.log(`   Prediction was: ${tip} (${match.confidence}% confidence)`)
        }
      }
    } else {
      console.log(`   ⚠️  Match not found or not finished on SofaScore`)
    }
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`)
  }
  
  // Delay to avoid rate limiting
  await new Promise(resolve => setTimeout(resolve, 2000))
}

console.log(`\n\n📊 Summary:`)
console.log(`   Updated: ${updated} matches with REAL SofaScore data`)
console.log(`   Won: ${won}`)
console.log(`   Lost: ${lost}`)
if (updated > 0) {
  console.log(`   Win Rate: ${Math.round((won / updated) * 100)}%`)
}
console.log(`\n✅ All results are from REAL match data!`)
