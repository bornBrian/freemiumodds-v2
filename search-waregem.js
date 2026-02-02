import fetch from 'node-fetch'

const query = 'Waregem'
const url = `https://www.sofascore.com/api/v1/search/all?q=${encodeURIComponent(query)}`
const response = await fetch(url, {
  headers: { 'User-Agent': 'Mozilla/5.0' }
})

const data = await response.json()
const events = data.results?.filter(r => r.type === 'event') || []

console.log(`Found ${events.length} events for "${query}":\n`)

events.slice(0, 10).forEach(e => {
  const d = new Date(e.entity.startTimestamp * 1000)
  const home = e.entity.homeTeam?.name || '?'
  const away = e.entity.awayTeam?.name || '?'
  const score = `${e.entity.homeScore?.display || '?'}-${e.entity.awayScore?.display || '?'}`
  console.log(`${d.toDateString()} | ${home} vs ${away} (${score})`)
})
