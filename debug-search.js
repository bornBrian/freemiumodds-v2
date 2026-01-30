import fetch from 'node-fetch'

const matches = [
  { home: 'Al Qanah', away: 'Raya' },
  { home: 'H. Akko', away: 'Maccabi Petah Tikva' },
  { home: 'Stoke City U21', away: 'Manchester City U21' },
  { home: 'CFR Cluj', away: 'Metaloglobus Bucharest' }
]

for (const match of matches) {
  console.log(`\n🔍 Searching: "${match.home} ${match.away}"`)
  console.log('═'.repeat(60))
  
  const searchQuery = encodeURIComponent(`${match.home} ${match.away}`)
  const url = `https://www.sofascore.com/api/v1/search/all?q=${searchQuery}`
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      }
    })
    
    if (!response.ok) {
      console.log(`❌ API Error: ${response.status}`)
      continue
    }
    
    const data = await response.json()
    
    if (data.results && data.results.length > 0) {
      console.log(`Found ${data.results.length} results:\n`)
      
      data.results.forEach((result, i) => {
        if (result.type === 'event' && result.entity) {
          const e = result.entity
          const date = new Date(e.startTimestamp * 1000)
          const dateStr = date.toISOString().split('T')[0]
          const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
          
          console.log(`${i+1}. ${e.homeTeam?.name || '?'} vs ${e.awayTeam?.name || '?'}`)
          console.log(`   Date: ${dateStr} ${timeStr}`)
          console.log(`   Status: ${e.status?.type || 'unknown'}`)
          console.log(`   Score: ${e.homeScore?.current || '?'}-${e.awayScore?.current || '?'}`)
          console.log(`   ID: ${e.id}`)
          console.log(`   League: ${e.tournament?.name || 'unknown'}`)
          console.log('')
        }
      })
    } else {
      console.log('❌ No results found')
    }
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`)
  }
  
  await new Promise(r => setTimeout(r, 2000))
}

process.exit(0)
