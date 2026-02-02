import fetch from 'node-fetch'
import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

// Extract team names from your SofaScore URLs
const matches = [
  { slug: 'sv-zulte-waregem-anderlecht', dbHome: 'Waregem W', dbAway: 'RSC Anderlecht W', tip: 'X2' },
  { slug: 'maccabi-bney-reine-hapoel-beer-sheva', dbHome: 'Maccabi Bnei Raina', dbAway: 'H. Beer Sheva', tip: 'X2' },
  { slug: 'cruz-azul-hidalgo-correcaminos-uat', dbHome: 'Correcaminos 2', dbAway: 'Atletico Hidalgo', tip: '1X' },
  { slug: 'kf-bylis-dinamo-city', dbHome: 'Dinamo Tirana', dbAway: 'Bylis', tip: '1X' }
]

console.log('Searching using URL slugs...\n')

for (const match of matches) {
  console.log(`DB: ${match.dbHome} vs ${match.dbAway}`)
  
  // Split slug and try different combinations
  const parts = match.slug.split('-')
  const queries = [
    match.slug.replace(/-/g, ' '),  // Full slug as query
    parts.slice(0, Math.ceil(parts.length/2)).join(' '),  // First half (home team)
    parts.slice(Math.ceil(parts.length/2)).join(' ')      // Second half (away team)
  ]
  
  let found = false
  
  for (const query of queries) {
    const searchUrl = `https://www.sofascore.com/api/v1/search/all?q=${encodeURIComponent(query)}`
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json'
      }
    })
    
    const data = await response.json()
    const events = data.results?.filter(r => r.type === 'event') || []
    
    const jan31 = events.filter(e => {
      const date = new Date(e.entity.startTimestamp * 1000)
      return date.toLocaleDateString().includes('1/31/2026')
    })
    
    if (jan31.length > 0) {
      const e = jan31[0].entity
      console.log(`  ✅ Found: ${e.homeTeam?.name} vs ${e.awayTeam?.name}`)
      console.log(`  Score: ${e.homeScore?.display}-${e.awayScore?.display}`)
      
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
      
      const emoji = result === 'won' ? '✅' : '❌'
      console.log(`  ${emoji} Updated - ${result.toUpperCase()}`)
      
      found = true
      break
    }
    
    await new Promise(r => setTimeout(r, 500))
  }
  
  if (!found) {
    console.log(`  ❌ Not found`)
  }
  
  console.log()
  await new Promise(r => setTimeout(r, 1000))
}

console.log('✅ Done')
