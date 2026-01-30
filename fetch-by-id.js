import { createClient } from '@supabase/supabase-js'
import fetch from 'node-fetch'

const supabase = createClient(
  'https://jtxpmlajhrkasfphuucm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0eHBtbGFqaHJrYXNmcGh1dWNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MTc5MzgsImV4cCI6MjA4NTI5MzkzOH0.dMvfwmwk4JC1Z_qxIxr45cDdZOHl2xO8FaQlZVklO_M'
)

const matchIds = {
  'H. Akko': 14092119,
  'Stoke City U21': 14372103,
  'CFR Cluj': 14060338
}

for (const [team, eventId] of Object.entries(matchIds)) {
  console.log(`\n🔍 Fetching details for ${team} match (ID: ${eventId})`)
  
  const url = `https://www.sofascore.com/api/v1/event/${eventId}`
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      }
    })
    
    if (!response.ok) {
      console.log(`❌ API Error: ${response.status}`)
      continue
    }
    
    const data = await response.json()
    const event = data.event
    
    console.log(`   ${event.homeTeam.name} vs ${event.awayTeam.name}`)
    console.log(`   Status: ${event.status.type}`)
    console.log(`   Score: ${event.homeScore.current}-${event.awayScore.current}`)
    console.log(`   Tournament: ${event.tournament.name}`)
    
    // Get match from database
    const { data: matches } = await supabase
      .from('matches')
      .select('*')
      .ilike('home', `%${team}%`)
      .single()
    
    if (matches) {
      const homeScore = event.homeScore.current
      const awayScore = event.awayScore.current
      const finalScore = `${homeScore}-${awayScore}`
      
      // Check prediction
      const tip = matches.tip
      let result = 'lost'
      
      if (tip === '1X' && homeScore >= awayScore) result = 'won'
      else if (tip === 'X2' && awayScore >= homeScore) result = 'won'
      else if (tip === '12' && homeScore !== awayScore) result = 'won'
      
      await supabase
        .from('matches')
        .update({ status: 'completed', result, final_score: finalScore })
        .eq('id', matches.id)
      
      const emoji = result === 'won' ? '✅' : '❌'
      console.log(`   ${emoji} Updated: ${finalScore} - ${result.toUpperCase()} (Tip: ${tip})`)
    }
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`)
  }
  
  await new Promise(r => setTimeout(r, 2000))
}

console.log('\n✅ Done fetching REAL SofaScore results!')
process.exit(0)
