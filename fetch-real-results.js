/**
 * AUTO-FETCH REAL results from SofaScore API
 * Runs automatically to update match results
 */
import { createClient } from '@supabase/supabase-js'
import fetch from 'node-fetch'
import 'dotenv/config'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

console.log('🔄 AUTO-FETCHING REAL results from SofaScore...\n')

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
    // Search SofaScore API
    const searchQuery = encodeURIComponent(`${match.home} ${match.away}`)
    const searchUrl = `https://www.sofascore.com/api/v1/search/all?q=${searchQuery}`
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      }
    })
    
    if (!response.ok) {
      console.log(`   ⚠️  API error: ${response.status}`)
      continue
    }
    
    const data = await response.json()
    
    // Find today's match in search results
    const matchDate = new Date(match.kickoff).toISOString().split('T')[0]
    let eventId = null
    
    if (data.results) {
      for (const result of data.results) {
        if (result.type === 'event' && result.entity) {
          const event = result.entity
          
          // Check if date matches
          const eventDate = new Date(event.startTimestamp * 1000).toISOString().split('T')[0]
          if (eventDate !== matchDate) continue
          
          // Check if teams match
          const homeMatch = event.homeTeam?.name?.toLowerCase().includes(match.home.toLowerCase().split(' ')[0])
          const awayMatch = event.awayTeam?.name?.toLowerCase().includes(match.away.toLowerCase().split(' ')[0])
          
          if (homeMatch && awayMatch && event.status?.type === 'finished') {
            eventId = event.id
            break
          }
        }
      }
    }
    
    if (eventId) {
      // Fetch detailed match data using event ID
      const detailUrl = `https://www.sofascore.com/api/v1/event/${eventId}`
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
          
          // Validate prediction
          const tip = match.tip || match.best_pick
          let result = 'lost'
          
          if (tip === '1X' && homeScore >= awayScore) result = 'won'
          else if (tip === 'X2' && awayScore >= homeScore) result = 'won'
          else if (tip === '12' && homeScore !== awayScore) result = 'won'
          
          // Update database with REAL score
          await supabase
            .from('matches')
            .update({
              status: 'completed',
              result: result,
              final_score: finalScore
            })
            .eq('id', match.id)
          
          updated++
          if (result === 'won') won++
          else lost++
          
          const emoji = result === 'won' ? '✅' : '❌'
          console.log(`   ${emoji} REAL: ${finalScore} - ${result.toUpperCase()}`)
        }
      }
    } else {
      console.log(`   ⚠️  Not found on SofaScore`)
    }
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`)
  }
  
  // Delay to avoid rate limiting
  await new Promise(resolve => setTimeout(resolve, 2000))
}

console.log(`\n\n📊 Summary:`)
console.log(`   Updated: ${updated} matches`)
console.log(`   Won: ${won}`)
console.log(`   Lost: ${lost}`)
if (updated > 0) {
  console.log(`   Win Rate: ${Math.round((won / updated) * 100)}%`)
}
console.log(`\n✅ AUTO-FETCH complete - all results from REAL SofaScore data!`)

process.exit(0)
