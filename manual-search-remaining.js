import fetch from 'node-fetch'
import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

// Remaining 4 matches to find
const searches = [
  { query: 'Zulte Waregem women', dbHome: 'Waregem W', dbAway: 'RSC Anderlecht W', tip: 'X2' },
  { query: 'Correcaminos', dbHome: 'Correcaminos 2', dbAway: 'Atletico Hidalgo', tip: '1X' },
  { query: 'America MG', dbHome: 'America MG', dbAway: 'URT', tip: '1X' },
  { query: 'Senador Guiomard', dbHome: 'Senador Guiomard', dbAway: 'Galvez', tip: '1X' }
]

for (const search of searches) {
  console.log(`\nSearching: ${search.query}`)
  console.log(`DB: ${search.dbHome} vs ${search.dbAway}`)
  
  const searchUrl = `https://www.sofascore.com/api/v1/search/all?q=${encodeURIComponent(search.query)}`
  const response = await fetch(searchUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Accept': 'application/json'
    }
  })
  
  const data = await response.json()
  const events = data.results?.filter(r => r.type === 'event') || []
  
  // Filter for Jan 31, 2026
  const jan31 = events.filter(e => {
    const date = new Date(e.entity.startTimestamp * 1000)
    const dateStr = date.toDateString()
    return dateStr.includes('Jan 31 2026')
  })
  
  console.log(`Found ${jan31.length} matches on Jan 31`)
  
  for (const result of jan31.slice(0, 3)) {
    const e = result.entity
    console.log(`  - ${e.homeTeam?.name} vs ${e.awayTeam?.name} (${e.homeScore?.display}-${e.awayScore?.display})`)
  }
  
  if (jan31.length > 0) {
    // Try to match the correct one
    const e = jan31[0].entity
    const homeScore = e.homeScore?.display
    const awayScore = e.awayScore?.display
    
    if (homeScore !== undefined && awayScore !== undefined) {
      // Calculate result
      let result = 'lost'
      
      if (search.tip === '1X' && homeScore >= awayScore) result = 'won'
      else if (search.tip === 'X2' && awayScore >= homeScore) result = 'won'
      else if (search.tip === '12' && homeScore !== awayScore) result = 'won'
      
      // Update database
      const { data: updated } = await supabase
        .from('matches')
        .update({
          status: 'completed',
          result: result,
          final_score: `${homeScore}-${awayScore}`
        })
        .eq('home', search.dbHome)
        .eq('away', search.dbAway)
        .eq('status', 'pending')
        .select()
      
      if (updated && updated.length > 0) {
        const emoji = result === 'won' ? '✅' : '❌'
        console.log(`${emoji} Updated ${e.homeTeam?.name} vs ${e.awayTeam?.name}: ${homeScore}-${awayScore} - ${result.toUpperCase()}`)
      }
    }
  }
  
  await new Promise(r => setTimeout(r, 1500))
}

console.log('\n✅ Done')
