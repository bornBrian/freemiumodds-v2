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

// Helper function to normalize team names for better matching
function normalizeTeam(name) {
  // Map known alternative names
  const nameMap = {
    'real madrid b': 'real madrid castilla',
    'barcelona b': 'barcelona athletic',
    'atletico madrid b': 'atletico madrid b',
    'osasuna b': 'osasuna promesas',
    'din. bucuresti': 'dinamo bucuresti',
    'dinamo bucuresti': 'fc dinamo bucuresti',
    'cfr cluj': 'cfr 1907 cluj',
    'istanbulspor as': 'istanbulspor',
    'airdrieonians': 'airdrie',
  }
  
  const lower = name.toLowerCase().trim()
  
  // Check if we have a direct mapping
  if (nameMap[lower]) {
    return nameMap[lower]
  }
  
  return lower
    .replace(/\s+fc\s*/gi, '')
    .replace(/\s+cf\s*/gi, '')
    .replace(/\s+sc\s*/gi, '')
    .replace(/\s+as\s*/gi, '')
    .replace(/\s+bk\s*/gi, '')
    .replace(/[^\w\s]/g, '') // Remove special chars
    .trim()
}

// Helper to check if teams match with fuzzy logic
function teamsMatch(searchName, resultName) {
  const search = normalizeTeam(searchName)
  const result = normalizeTeam(resultName)
  
  // Direct match
  if (search === result) return true
  
  // Get first significant word (usually the main team name)
  const searchWords = search.split(' ').filter(w => w.length > 2)
  const resultWords = result.split(' ').filter(w => w.length > 2)
  
  // Check if any significant word matches (at least 2 matches for accuracy)
  let matches = 0
  for (const sw of searchWords) {
    for (const rw of resultWords) {
      if (sw.includes(rw) || rw.includes(sw)) {
        matches++
      }
    }
  }
  return matches >= Math.min(2, searchWords.length)
}

for (const match of matches) {
  console.log(`\n🔍 ${match.home} vs ${match.away}`)
  
  try {
    // Normalize team names first for better search
    const normalizedHome = normalizeTeam(match.home)
    const normalizedAway = normalizeTeam(match.away)
    
    // Try multiple search strategies with both original and normalized names
    const searchQueries = [
      `${match.home} ${match.away}`, // Original
      `${normalizedHome} ${normalizedAway}`, // Normalized
      normalizedHome, // Just home team normalized
      normalizedAway, // Just away team normalized
      match.home, // Original home
      match.away, // Original away
    ]
    
    let eventId = null
    const matchDate = new Date(match.kickoff).toISOString().split('T')[0]
    
    for (const query of searchQueries) {
      if (eventId) break // Already found
      
      const searchQuery = encodeURIComponent(query)
      const searchUrl = `https://www.sofascore.com/api/v1/search/all?q=${searchQuery}`
      
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json'
        }
      })
      
      if (!response.ok) continue
      
      const data = await response.json()
      
      if (data.results) {
        for (const result of data.results) {
          if (result.type === 'event' && result.entity) {
            const event = result.entity
            
            // Check if date matches
            const eventDate = new Date(event.startTimestamp * 1000).toISOString().split('T')[0]
            if (eventDate !== matchDate) continue
            
            // Use fuzzy team matching
            const homeMatch = teamsMatch(match.home, event.homeTeam?.name || '')
            const awayMatch = teamsMatch(match.away, event.awayTeam?.name || '')
            
            if (homeMatch && awayMatch && event.status?.type === 'finished') {
              eventId = event.id
              console.log(`   🎯 Found: ${event.homeTeam.name} vs ${event.awayTeam.name}`)
              break
            }
          }
        }
      }
      
      // Small delay between searches
      await new Promise(resolve => setTimeout(resolve, 500))
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
