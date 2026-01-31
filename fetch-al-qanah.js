import { createClient } from '@supabase/supabase-js'
import fetch from 'node-fetch'
import 'dotenv/config'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

const eventId = 14293487

console.log(`🔍 Fetching Al Qanah vs Raya match (SofaScore ID: ${eventId})\n`)

const url = `https://www.sofascore.com/api/v1/event/${eventId}`

const response = await fetch(url, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/json'
  }
})

const data = await response.json()
const event = data.event

console.log(`${event.homeTeam.name} vs ${event.awayTeam.name}`)
console.log(`Status: ${event.status.type}`)
console.log(`Score: ${event.homeScore?.current || '?'}-${event.awayScore?.current || '?'}`)
console.log(`League: ${event.tournament.name}`)

if (event.status.type === 'finished' && event.homeScore && event.awayScore) {
  const homeScore = event.homeScore.current
  const awayScore = event.awayScore.current
  const finalScore = `${homeScore}-${awayScore}`
  
  // Update in database - Al Qanah is home team, prediction was 1X
  const { data: match } = await supabase
    .from('matches')
    .select('*')
    .ilike('home', '%Al Qanah%')
    .single()
  
  if (match) {
    const tip = match.tip
    let result = 'lost'
    
    // Canal SC is home (Raya is away) - but in our DB Al Qanah is home
    // So we need to FLIP the scores
    if (tip === '1X' && awayScore >= homeScore) result = 'won'
    else if (tip === 'X2' && homeScore >= awayScore) result = 'won'
    else if (tip === '12' && homeScore !== awayScore) result = 'won'
    
    // Store as Al Qanah score first (they are home in our DB, away on SofaScore)
    const flippedScore = `${awayScore}-${homeScore}`
    
    await supabase
      .from('matches')
      .update({ 
        status: 'completed', 
        result, 
        final_score: flippedScore
      })
      .eq('id', match.id)
    
    const emoji = result === 'won' ? '✅' : '❌'
    console.log(`\n${emoji} Updated: ${flippedScore} (Al Qanah-Raya) - ${result.toUpperCase()}`)
    console.log(`   Note: SofaScore has teams reversed (Canal SC = Al Qanah)`)
  }
}

process.exit(0)
