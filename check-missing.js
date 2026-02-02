/**
 * Final check on "not found" matches
 */
import fetch from 'node-fetch'

const matches = [
  'Waregem W RSC Anderlecht W',
  'Boreham Wood Boston',
  'Westerlo Brugge',
  'Maccabi Bnei Raina Beer Sheva'
]

for (const query of matches) {
  console.log(`\nSearching: ${query}`)
  const searchUrl = `https://www.sofascore.com/api/v1/search/all?q=${encodeURIComponent(query)}`
  
  const response = await fetch(searchUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json'
    }
  })
  
  const data = await response.json()
  const events = data.results?.filter(r => r.type === 'event') || []
  
  console.log(`Found ${events.length} events`)
  
  if (events.length > 0) {
    const recent = events.filter(e => {
      const ts = e.entity.startTimestamp * 1000
      const jan31 = new Date('2026-01-31').getTime()
      return Math.abs(ts - jan31) < 7 * 24 * 60 * 60 * 1000
    })
    
    console.log(`  ${recent.length} from around Jan 31, 2026`)
    
    if (recent.length > 0) {
      recent.slice(0, 2).forEach(r => {
        const e = r.entity
        console.log(`  - ${e.homeTeam?.name} vs ${e.awayTeam?.name}`)
        console.log(`    ${new Date(e.startTimestamp * 1000).toLocaleDateString()} - ${e.status?.type}`)
      })
    }
  }
  
  await new Promise(resolve => setTimeout(resolve, 1500))
}
