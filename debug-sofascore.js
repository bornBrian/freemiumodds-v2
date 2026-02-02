/**
 * Debug SofaScore search to see what's being returned
 */
import fetch from 'node-fetch'

const match = {
  home: 'Hamburger SV',
  away: 'Bayern Munich',
  kickoff: '2026-01-31T14:30:00+00:00'
}

console.log(`Searching for: ${match.home} vs ${match.away}\n`)

const query = `${match.home} ${match.away}`
const searchUrl = `https://www.sofascore.com/api/v1/search/all?q=${encodeURIComponent(query)}`

console.log(`URL: ${searchUrl}\n`)

const response = await fetch(searchUrl, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/json',
    'Accept-Language': 'en-US,en;q=0.9'
  }
})

console.log(`Status: ${response.status}\n`)

const data = await response.json()

console.log('Full response:')
console.log(JSON.stringify(data, null, 2))

if (data.results) {
  const events = data.results.filter(r => r.type === 'event')
  console.log(`\n\nFound ${events.length} event(s)`)
  
  events.slice(0, 3).forEach((result, i) => {
    const e = result.entity
    console.log(`\nEvent ${i + 1}:`)
    console.log(`  Home: ${e.homeTeam?.name}`)
    console.log(`  Away: ${e.awayTeam?.name}`)
    console.log(`  Status: ${e.status?.type}`)
    console.log(`  Score: ${e.homeScore?.current ?? '?'}-${e.awayScore?.current ?? '?'}`)
    console.log(`  Timestamp: ${e.startTimestamp}`)
    console.log(`  Date: ${new Date(e.startTimestamp * 1000).toLocaleString()}`)
  })
}
