/**
 * Manually fetch and update the 6 remaining matches using direct IDs
 */
import { createClient } from '@supabase/supabase-js'
import fetch from 'node-fetch'
import 'dotenv/config'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

// Event IDs from the URLs you provided
const matches = [
  { eventId: 'cpwbsbmyc', home: 'Waregem W', away: 'RSC Anderlecht W', tip: 'X2' },
  { eventId: 'cecsUXjc', home: 'Maccabi Bnei Raina', away: 'H. Beer Sheva', tip: 'X2' },
  { eventId: 'PXFbscRtc', home: 'Bodrumspor', away: 'Serik Spor', tip: '1X' },
  { eventId: 'BFosCFo', home: 'Correcaminos 2', away: 'Atletico Hidalgo', tip: '1X' }
]

console.log('Fetching matches directly by Event ID...\n')

for (const match of matches) {
  console.log(`${match.home} vs ${match.away}`)
  
  // Try the event ID directly
  const detailUrl = `https://www.sofascore.com/api/v1/event/${match.eventId}`
  
  try {
    const response = await fetch(detailUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      const event = data.event
      
      const homeScore = event.homeScore?.display ?? event.homeScore?.current
      const awayScore = event.awayScore?.display ?? event.awayScore?.current
      
      if (homeScore !== undefined && awayScore !== undefined) {
        console.log(`  Score: ${homeScore}-${awayScore}`)
        
        // Determine result
        let result = 'lost'
        if (match.tip === '1X' && homeScore >= awayScore) result = 'won'
        else if (match.tip === 'X2' && awayScore >= homeScore) result = 'won'
        else if (match.tip === '12' && homeScore !== awayScore) result = 'won'
        
        // Update database
        const { data: updated, error } = await supabase
          .from('matches')
          .update({
            status: 'completed',
            result: result,
            final_score: `${homeScore}-${awayScore}`,
            updated_at: new Date().toISOString()
          })
          .eq('home', match.home)
          .eq('away', match.away)
          .eq('status', 'pending')
          .select()
        
        if (error) {
          console.log(`  ❌ DB Error: ${error.message}`)
        } else if (updated && updated.length > 0) {
          const emoji = result === 'won' ? '✅' : '❌'
          console.log(`  ${emoji} Updated - ${result.toUpperCase()}`)
        } else {
          console.log(`  ⚠️  Not found in database`)
        }
      }
    } else {
      console.log(`  ❌ API returned ${response.status}`)
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`)
  }
  
  console.log()
  await new Promise(resolve => setTimeout(resolve, 1000))
}

console.log('✅ Manual update complete')
