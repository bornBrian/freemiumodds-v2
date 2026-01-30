/**
 * Test SofaScore API with your actual matches
 */
import fetch from 'node-fetch'

console.log('🔍 Testing SofaScore API for your matches...\n')

const matches = [
  'Al Qanah Raya',
  'H. Akko Maccabi Petah Tikva',
  'Stoke City U21 Manchester City U21',
  'CFR Cluj Metaloglobus'
]

for (const matchQuery of matches) {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`Searching: ${matchQuery}`)
  console.log('='.repeat(60))
  
  try {
    const searchUrl = `https://www.sofascore.com/api/v1/search/all?q=${encodeURIComponent(matchQuery)}`
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      }
    })
    
    const data = await response.json()
    
    if (data.results) {
      const events = data.results.filter(r => r.type === 'event')
      
      if (events.length > 0) {
        console.log(`\nFound ${events.length} matches:\n`)
        
        events.slice(0, 3).forEach((result, i) => {
          const e = result.entity
          console.log(`${i + 1}. ${e.homeTeam?.name} vs ${e.awayTeam?.name}`)
          console.log(`   Status: ${e.status?.type}`)
          console.log(`   Score: ${e.homeScore?.current ?? '?'}-${e.awayScore?.current ?? '?'}`)
          console.log(`   League: ${e.tournament?.name}`)
          console.log(`   ID: ${e.id}`)
          console.log('')
        })
      } else {
        console.log('❌ No matches found')
      }
    }
  } catch (error) {
    console.error(`Error: ${error.message}`)
  }
  
  await new Promise(resolve => setTimeout(resolve, 2000))
}

console.log('\n✅ Test complete')
