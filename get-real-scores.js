/**
 * Get REAL scores from SofaScore by match ID
 */
import fetch from 'node-fetch'

console.log('🔍 Fetching REAL scores from SofaScore...\n')

const matchIds = {
  'H. Akko vs Maccabi Petah Tikva': 14092119,
  'Stoke City U21 vs Manchester City U21': 14372103,
  'CFR Cluj vs Metaloglobus': 14060338
}

for (const [matchName, matchId] of Object.entries(matchIds)) {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`${matchName}`)
  console.log('='.repeat(60))
  
  try {
    const url = `https://www.sofascore.com/api/v1/event/${matchId}`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      }
    })
    
    const data = await response.json()
    const event = data.event
    
    if (event) {
      console.log(`\n✅ ${event.homeTeam.name} vs ${event.awayTeam.name}`)
      console.log(`   Final Score: ${event.homeScore.current}-${event.awayScore.current}`)
      console.log(`   Status: ${event.status.type}`)
      console.log(`   League: ${event.tournament.name}`)
      console.log(`   Date: ${new Date(event.startTimestamp * 1000).toLocaleString()}`)
    }
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`)
  }
  
  await new Promise(resolve => setTimeout(resolve, 1500))
}

console.log('\n\n✅ These are the REAL scores from SofaScore!')
