import fetch from 'node-fetch'

console.log('🔍 Checking Sporting CP vs AFS...\n')

const url = `https://www.sofascore.com/api/v1/search/all?q=${encodeURIComponent('Sporting CP AFS February 2026')}`

const response = await fetch(url, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/json'
  }
})

const data = await response.json()

console.log('All Sporting CP matches found:\n')

if (data.results) {
  for (const result of data.results) {
    if (result.type === 'event' && result.entity) {
      const event = result.entity
      if (event.homeTeam?.name?.includes('Sporting') || event.awayTeam?.name?.includes('Sporting')) {
        console.log(`${event.homeTeam.name} vs ${event.awayTeam.name}`)
        console.log(`  Score: ${event.homeScore?.display || '?'}-${event.awayScore?.display || '?'}`)
        console.log(`  Status: ${event.status.type}`)
        console.log(`  Date: ${event.startTimestamp ? new Date(event.startTimestamp * 1000).toLocaleString() : '?'}`)
        console.log()
      }
    }
  }
}
