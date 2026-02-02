import fetch from 'node-fetch'
import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

const matches = [
  { id: 'cpwbsbmyc', dbHome: 'Waregem W', dbAway: 'RSC Anderlecht W', tip: 'X2' },
  { id: 'BFosCFo', dbHome: 'Correcaminos 2', dbAway: 'Atletico Hidalgo', tip: '1X' },
  { id: 'PXFbscRtc', dbHome: 'Bodrumspor', dbAway: 'Serik Spor', tip: '1X' }  // Already updated but checking
]

for (const match of matches) {
  const url = `https://www.sofascore.com/api/v1/event/${match.id}`
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Accept': 'application/json'
    }
  })
  
  const data = await response.json()
  const e = data.event
  
  console.log(`\n${match.dbHome} vs ${match.dbAway}`)
  console.log(`SofaScore: ${e.homeTeam.name} vs ${e.awayTeam.name}`)
  console.log(`Score: ${e.homeScore.display}-${e.awayScore.display}`)
  
  // Calculate result
  let result = 'lost'
  const homeScore = e.homeScore.display
  const awayScore = e.awayScore.display
  
  if (match.tip === '1X' && homeScore >= awayScore) result = 'won'
  else if (match.tip === 'X2' && awayScore >= homeScore) result = 'won'
  else if (match.tip === '12' && homeScore !== awayScore) result = 'won'
  
  // Update database
  const { data: updated, error } = await supabase
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
    console.log(`⚠️ Already updated or not found in DB`)
  }
  
  await new Promise(r => setTimeout(r, 1000))
}

console.log('\n✅ Done')
