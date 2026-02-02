import fetch from 'node-fetch'
import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

const matches = [
  { home: 'SV Zulte Waregem', away: 'Anderlecht', dbHome: 'Waregem W', dbAway: 'RSC Anderlecht W', tip: 'X2' },
  { home: 'Cruz Azul Hidalgo', away: 'Correcaminos UAT', dbHome: 'Correcaminos 2', dbAway: 'Atletico Hidalgo', tip: '1X' }
]

for (const match of matches) {
  console.log(`\nSearching: ${match.home} vs ${match.away}`)
  console.log(`DB: ${match.dbHome} vs ${match.dbAway}`)
  
  // Search with home team
  const searchUrl = `https://www.sofascore.com/api/v1/search/all?q=${encodeURIComponent(match.home)}`
  const response = await fetch(searchUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Accept': 'application/json'
    }
  })
  
  const data = await response.json()
  const events = data.results?.filter(r => r.type === 'event') || []
  
  // Find Jan 31 matches
  const jan31 = events.filter(e => {
    const date = new Date(e.entity.startTimestamp * 1000)
    return date.toLocaleDateString().includes('1/31/2026')
  })
  
  console.log(`Found ${jan31.length} matches on Jan 31`)
  
  if (jan31.length > 0) {
    const e = jan31[0].entity
    console.log(`Match: ${e.homeTeam?.name} vs ${e.awayTeam?.name}`)
    console.log(`Score: ${e.homeScore?.display}-${e.awayScore?.display}`)
    
    // Calculate result
    let result = 'lost'
    const homeScore = e.homeScore?.display
    const awayScore = e.awayScore?.display
    
    if (match.tip === '1X' && homeScore >= awayScore) result = 'won'
    else if (match.tip === 'X2' && awayScore >= homeScore) result = 'won'
    else if (match.tip === '12' && homeScore !== awayScore) result = 'won'
    
    // Update database
    const { data: updated } = await supabase
      .from('matches')
      .update({
        status: 'completed',
        result: result,
        final_score: `${homeScore}-${awayScore}`
      })
      .eq('home', match.dbHome)
      .eq('away', match.dbAway)
      .eq('status', 'pending')
      .select()
    
    if (updated && updated.length > 0) {
      const emoji = result === 'won' ? '✅' : '❌'
      console.log(`${emoji} Updated - ${result.toUpperCase()}`)
    } else {
      console.log(`⚠️ Not updated (might already be completed)`)
    }
  }
  
  await new Promise(r => setTimeout(r, 1000))
}

console.log('\n✅ Done')
