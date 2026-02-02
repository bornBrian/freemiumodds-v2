/**
 * Search for these matches directly on SofaScore
 */
import fetch from 'node-fetch'

const searches = [
  { query: 'Zulte Waregem Anderlecht', ourMatch: 'Waregem W vs RSC Anderlecht W' },
  { query: 'Boreham Wood Boston', ourMatch: 'Boreham Wood vs Boston Utd' },
  { query: 'Westerlo Club Brugge', ourMatch: 'Westerlo W vs Club Brugge W' }
]

for (const search of searches) {
  console.log(`\n${'='.repeat(70)}`)
  console.log(`Our match: ${search.ourMatch}`)
  console.log(`Searching: "${search.query}"`)
  console.log('='.repeat(70))
  
  const searchUrl = `https://www.sofascore.com/api/v1/search/all?q=${encodeURIComponent(search.query)}`
  
  const response = await fetch(searchUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json'
    }
  })
  
  const data = await response.json()
  const events = data.results?.filter(r => r.type === 'event') || []
  
  console.log(`\nFound ${events.length} events`)
  
  // Look for Jan 31, 2026 matches
  const jan31 = new Date('2026-01-31').getTime()
  const relevant = events.filter(e => {
    const ts = e.entity.startTimestamp * 1000
    return Math.abs(ts - jan31) < 24 * 60 * 60 * 1000
  })
  
  console.log(`${relevant.length} from Jan 31, 2026:\n`)
  
  relevant.forEach(e => {
    const evt = e.entity
    console.log(`  ✅ ${evt.homeTeam?.name} vs ${evt.awayTeam?.name}`)
    console.log(`     Status: ${evt.status?.type}`)
    console.log(`     Score: ${evt.homeScore?.display ?? '?'}-${evt.awayScore?.display ?? '?'}`)
    console.log(`     Date: ${new Date(evt.startTimestamp * 1000).toLocaleString()}`)
    console.log(`     ID: ${evt.id}`)
    console.log()
  })
  
  await new Promise(resolve => setTimeout(resolve, 1500))
}
