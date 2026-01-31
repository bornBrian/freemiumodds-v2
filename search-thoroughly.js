import fetch from 'node-fetch'

const searches = [
  'Al Qanah',
  'Raya',
  'Al-Qanah',
  'El Qanah',
  'Egypt Division 2',
  'Al Qanah El Raya',
  'Qanah Raya'
]

for (const term of searches) {
  console.log(`\n🔍 Searching: "${term}"`)
  console.log('═'.repeat(70))
  
  const url = `https://www.sofascore.com/api/v1/search/all?q=${encodeURIComponent(term)}`
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      }
    })
    
    const data = await response.json()
    
    if (data.results && data.results.length > 0) {
      // Filter for today's matches
      const today = '2026-01-30'
      const todayMatches = []
      
      data.results.forEach(result => {
        if (result.type === 'event' && result.entity) {
          const e = result.entity
          const date = new Date(e.startTimestamp * 1000).toISOString().split('T')[0]
          
          if (date === today) {
            todayMatches.push({
              home: e.homeTeam?.name,
              away: e.awayTeam?.name,
              league: e.tournament?.name,
              status: e.status?.type,
              id: e.id,
              time: new Date(e.startTimestamp * 1000).toLocaleTimeString()
            })
          }
        }
      })
      
      if (todayMatches.length > 0) {
        console.log(`✅ Found ${todayMatches.length} match(es) from today:\n`)
        todayMatches.forEach(m => {
          console.log(`   ${m.home} vs ${m.away}`)
          console.log(`   League: ${m.league}`)
          console.log(`   Time: ${m.time}`)
          console.log(`   Status: ${m.status}`)
          console.log(`   ID: ${m.id}`)
          console.log('')
        })
      } else {
        console.log(`⚠️  Found ${data.results.length} results but none from today`)
      }
    } else {
      console.log('❌ No results')
    }
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`)
  }
  
  await new Promise(r => setTimeout(r, 1500))
}

process.exit(0)
