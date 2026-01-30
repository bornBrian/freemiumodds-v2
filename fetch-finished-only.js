import { createClient } from '@supabase/supabase-js'
import fetch from 'node-fetch'

const supabase = createClient(
  'https://jtxpmlajhrkasfphuucm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0eHBtbGFqaHJrYXNmcGh1dWNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MTc5MzgsImV4cCI6MjA4NTI5MzkzOH0.dMvfwmwk4JC1Z_qxIxr45cDdZOHl2xO8FaQlZVklO_M'
)

console.log('🔄 Fetching REAL scores for finished matches only...\n')

// Only get matches that finished 2+ hours ago
const twoHoursAgo = new Date(Date.now() - 120 * 60 * 1000).toISOString()
const { data: matches } = await supabase
  .from('matches')
  .select('*')
  .lt('kickoff', twoHoursAgo)
  .eq('status', 'pending')

if (!matches || matches.length === 0) {
  console.log('✅ No finished matches need updating')
  process.exit(0)
}

console.log(`📊 Found ${matches.length} matches that should be finished:\n`)

for (const match of matches) {
  console.log(`🔍 ${match.home} vs ${match.away}`)
  console.log(`   Kickoff: ${new Date(match.kickoff).toLocaleTimeString()}`)
  
  try {
    // Search with today's date filter
    const searchQuery = encodeURIComponent(`${match.home} ${match.away}`)
    const searchUrl = `https://www.sofascore.com/api/v1/search/all?q=${searchQuery}`
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      }
    })
    
    if (!response.ok) {
      console.log(`   ⚠️  API error: ${response.status}\n`)
      continue
    }
    
    const data = await response.json()
    
    // Find today's match
    const today = '2026-01-30'
    let foundMatch = null
    
    if (data.results) {
      for (const result of data.results) {
        if (result.type === 'event' && result.entity) {
          const event = result.entity
          
          // Check date matches today
          const eventDate = new Date(event.startTimestamp * 1000).toISOString().split('T')[0]
          if (eventDate !== today) continue
          
          // Check teams match
          const homeMatch = event.homeTeam?.name?.toLowerCase().includes(match.home.toLowerCase().split(' ')[0])
          const awayMatch = event.awayTeam?.name?.toLowerCase().includes(match.away.toLowerCase().split(' ')[0])
          
          if (homeMatch && awayMatch && event.status?.type === 'finished') {
            foundMatch = event
            break
          }
        }
      }
    }
    
    if (foundMatch) {
      const homeScore = foundMatch.homeScore?.current ?? foundMatch.homeScore?.display
      const awayScore = foundMatch.awayScore?.current ?? foundMatch.awayScore?.display
      
      if (homeScore !== undefined && awayScore !== undefined) {
        const finalScore = `${homeScore}-${awayScore}`
        
        // Validate prediction
        const tip = match.tip
        let result = 'lost'
        
        if (tip === '1X' && homeScore >= awayScore) result = 'won'
        else if (tip === 'X2' && awayScore >= homeScore) result = 'won'
        else if (tip === '12' && homeScore !== awayScore) result = 'won'
        
        await supabase
          .from('matches')
          .update({ status: 'completed', result, final_score: finalScore })
          .eq('id', match.id)
        
        const emoji = result === 'won' ? '✅' : '❌'
        console.log(`   ${emoji} REAL: ${finalScore} - ${result.toUpperCase()} (${tip})`)
      }
    } else {
      console.log(`   ⚠️  Not found on SofaScore`)
    }
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`)
  }
  
  console.log('')
  await new Promise(r => setTimeout(r, 2000))
}

console.log('✅ Done!')
process.exit(0)
