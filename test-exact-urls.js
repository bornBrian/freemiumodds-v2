/**
 * Fetch the exact matches from SofaScore URLs
 */
import fetch from 'node-fetch'

const matches = [
  {
    url: 'https://www.sofascore.com/football/match/sv-zulte-waregem-anderlecht/cpwbsbmyc',
    id: null, // Will extract from API
    name: 'Waregem W vs RSC Anderlecht W'
  },
  {
    url: 'https://www.sofascore.com/football/match/boreham-wood-boston-united/zcsrEo',
    id: null,
    name: 'Boreham Wood vs Boston Utd'
  },
  {
    url: 'https://www.sofascore.com/football/match/kvc-westerlo-club-yla/apwbsTMYd',
    id: null,
    name: 'Westerlo W vs Club Brugge W'
  }
]

console.log('Fetching matches from SofaScore URLs...\n')

for (const match of matches) {
  // Extract event ID from URL
  const urlParts = match.url.split('/')
  const eventId = urlParts[urlParts.length - 1]
  
  console.log(`\n${'='.repeat(70)}`)
  console.log(`Match: ${match.name}`)
  console.log(`Event ID: ${eventId}`)
  console.log('='.repeat(70))
  
  // Fetch event details
  const detailUrl = `https://www.sofascore.com/api/v1/event/${eventId}`
  
  try {
    const response = await fetch(detailUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      }
    })
    
    if (!response.ok) {
      console.log(`❌ Failed to fetch: ${response.status}`)
      continue
    }
    
    const data = await response.json()
    const event = data.event
    
    console.log(`\nHome: ${event.homeTeam?.name}`)
    console.log(`Away: ${event.awayTeam?.name}`)
    console.log(`Status: ${event.status?.type}`)
    console.log(`Score: ${event.homeScore?.display ?? '?'}-${event.awayScore?.display ?? '?'}`)
    console.log(`Date: ${new Date(event.startTimestamp * 1000).toLocaleString()}`)
    console.log(`Tournament: ${event.tournament?.name}`)
    
    // Test if our search would find this
    const searchQueries = [
      `${event.homeTeam?.name} ${event.awayTeam?.name}`,
      event.homeTeam?.name,
      event.awayTeam?.name
    ]
    
    console.log(`\nTesting search queries:`)
    for (const query of searchQueries) {
      const searchUrl = `https://www.sofascore.com/api/v1/search/all?q=${encodeURIComponent(query)}`
      const searchResponse = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json'
        }
      })
      
      const searchData = await searchResponse.json()
      const events = searchData.results?.filter(r => r.type === 'event') || []
      const found = events.find(e => e.entity.id === eventId)
      
      console.log(`  "${query}" → ${events.length} events, ${found ? '✅ FOUND' : '❌ NOT FOUND'}`)
      
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`)
  }
  
  await new Promise(resolve => setTimeout(resolve, 1000))
}

console.log('\n' + '='.repeat(70))
console.log('Analysis complete')
