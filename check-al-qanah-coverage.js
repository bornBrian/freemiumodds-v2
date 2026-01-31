import fetch from 'node-fetch'

console.log('🔍 Searching SofaScore for: Al Qanah vs Raya\n')

const searchQuery = encodeURIComponent('Al Qanah Raya')
const url = `https://www.sofascore.com/api/v1/search/all?q=${searchQuery}`

const response = await fetch(url, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/json'
  }
})

const data = await response.json()

if (data.results && data.results.length > 0) {
  console.log(`Found ${data.results.length} results:\n`)
  
  // Look for events from today
  const today = '2026-01-30'
  let foundToday = false
  
  data.results.forEach((result, i) => {
    if (result.type === 'event' && result.entity) {
      const e = result.entity
      const date = new Date(e.startTimestamp * 1000)
      const dateStr = date.toISOString().split('T')[0]
      
      if (dateStr === today) {
        foundToday = true
        console.log(`${i+1}. ${e.homeTeam?.name || '?'} vs ${e.awayTeam?.name || '?'}`)
        console.log(`   Date: ${dateStr}`)
        console.log(`   Status: ${e.status?.type || 'unknown'}`)
        console.log(`   League: ${e.tournament?.name || 'unknown'}`)
        console.log('')
      }
    }
  })
  
  if (!foundToday) {
    console.log('❌ No matches from today (2026-01-30) found')
    console.log('\nSofaScore does NOT cover this league: Egypt Division 2 A')
    console.log('This is a minor league with no coverage.')
  }
} else {
  console.log('❌ No results found - SofaScore does not cover this league')
}

process.exit(0)
