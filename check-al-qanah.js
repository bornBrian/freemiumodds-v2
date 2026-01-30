import fetch from 'node-fetch'

// Get Al Qanah vs Raya real score
console.log('🔍 Getting Al Qanah vs Raya score from SofaScore...\n')

try {
  const searchUrl = 'https://www.sofascore.com/api/v1/search/all?q=' + encodeURIComponent('Al Qanah Raya')
  
  const searchResponse = await fetch(searchUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json'
    }
  })
  
  const searchData = await searchResponse.json()
  const match = searchData.results?.find(r => r.entity.type === 'event')
  
  if (match) {
    const matchId = match.entity.id
    console.log(`Found match ID: ${matchId}`)
    
    const detailUrl = `https://www.sofascore.com/api/v1/event/${matchId}`
    const detailResponse = await fetch(detailUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      }
    })
    
    const detailData = await detailResponse.json()
    const event = detailData.event
    
    console.log(`\n✅ ${event.homeTeam.name} vs ${event.awayTeam.name}`)
    console.log(`   Final Score: ${event.homeScore.current}-${event.awayScore.current}`)
    console.log(`   Status: ${event.status.type}`)
  }
} catch (error) {
  console.error('Error:', error.message)
}
