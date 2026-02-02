/**
 * Debug Boreham Wood match specifically
 */
import fetch from 'node-fetch'

const match = {
  home: 'Boreham Wood',
  away: 'Boston Utd',
  kickoff: '2026-01-31T15:00:00'  // 3:00 PM
}

const matchTimestamp = new Date(match.kickoff).getTime()
console.log(`Looking for: ${match.home} vs ${match.away}`)
console.log(`Our kickoff: ${new Date(matchTimestamp).toLocaleString()}\n`)

const query = `${match.home} ${match.away}`
const searchUrl = `https://www.sofascore.com/api/v1/search/all?q=${encodeURIComponent(query)}`

const response = await fetch(searchUrl, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/json'
  }
})

const data = await response.json()
const events = data.results?.filter(r => r.type === 'event') || []

console.log(`Found ${events.length} events\n`)

events.slice(0, 3).forEach((result, i) => {
  const e = result.entity
  const eventTimestamp = e.startTimestamp * 1000
  const timeDiff = Math.abs(eventTimestamp - matchTimestamp) / 1000 / 60 / 60
  
  console.log(`${i + 1}. ${e.homeTeam?.name} vs ${e.awayTeam?.name}`)
  console.log(`   Status: ${e.status?.type}`)
  console.log(`   Score: ${e.homeScore?.display}-${e.awayScore?.display}`)
  console.log(`   Event time: ${new Date(eventTimestamp).toLocaleString()}`)
  console.log(`   Time diff: ${timeDiff.toFixed(1)} hours`)
  console.log(`   Within 3 days: ${timeDiff <= 72 ? 'YES ✅' : 'NO ❌'}`)
  console.log()
})
