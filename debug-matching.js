/**
 * Debug the exact matching issue
 */
import fetch from 'node-fetch'

const match = {
  home: 'Hamburger SV',
  away: 'Bayern Munich',
  kickoff: '2026-01-31T14:30:00+00:00'
}

const matchTimestamp = new Date(match.kickoff).getTime()
console.log(`Match timestamp: ${matchTimestamp}`)
console.log(`Match date: ${new Date(matchTimestamp).toLocaleString()}\n`)

const query = `${match.home} ${match.away}`
const searchUrl = `https://www.sofascore.com/api/v1/search/all?q=${encodeURIComponent(query)}`

const response = await fetch(searchUrl, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/json',
    'Accept-Language': 'en-US,en;q=0.9'
  }
})

const data = await response.json()

const events = data.results?.filter(r => r.type === 'event') || []
console.log(`Found ${events.length} events\n`)

// Check the first few events
for (let i = 0; i < Math.min(3, events.length); i++) {
  const event = events[i].entity
  const eventTimestamp = event.startTimestamp * 1000
  const timeDiff = Math.abs(eventTimestamp - matchTimestamp)
  
  console.log(`Event ${i + 1}:`)
  console.log(`  Home: "${event.homeTeam?.name}"`)
  console.log(`  Away: "${event.awayTeam?.name}"`)
  console.log(`  Status: ${event.status?.type}`)
  console.log(`  Event timestamp: ${eventTimestamp}`)
  console.log(`  Event date: ${new Date(eventTimestamp).toLocaleString()}`)
  console.log(`  Time diff: ${Math.round(timeDiff / 1000 / 60 / 60)} hours`)
  console.log(`  Home score: ${event.homeScore?.current ?? event.homeScore?.display}`)
  console.log(`  Away score: ${event.awayScore?.current ?? event.awayScore?.display}`)
  
  // Test matching
  const normHome = match.home.toLowerCase().trim()
  const normAway = match.away.toLowerCase().trim().replace(/\s+fc\s*/gi, '').replace(/\s+cf\s*/gi, '')
  const eventHome = event.homeTeam?.name.toLowerCase()
  const eventAway = event.awayTeam?.name.toLowerCase().replace(/\s+fc\s*/gi, '').replace(/\s+cf\s*/gi, '').replace('münchen', 'munich')
  
  console.log(`  Match home normalized: "${normHome}"`)
  console.log(`  Event home normalized: "${eventHome}"`)
  console.log(`  Match away normalized: "${normAway}"`)
  console.log(`  Event away normalized: "${eventAway}"`)
  console.log(`  Home match: ${normHome === eventHome || normHome.includes(eventHome) || eventHome.includes(normHome)}`)
  console.log(`  Away match: ${normAway === eventAway || normAway.includes(eventAway) || eventAway.includes(normAway)}`)
  console.log()
}
