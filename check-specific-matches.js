import fetch from 'node-fetch'

const matches = [
  { home: 'Maccabi Jaffa', away: 'Maccabi Tel Aviv', tip: 'X2' },
  { home: 'Sporting CP', away: 'AFS', tip: '1X' },
  { home: 'Mixto', away: 'Sport Sinop', tip: '1X' }
]

console.log('🔍 Checking specific match results...\n')

for (const match of matches) {
  const query = `${match.home} ${match.away}`
  const url = `https://www.sofascore.com/api/v1/search/all?q=${encodeURIComponent(query)}`
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      }
    })
    
    const data = await response.json()
    console.log(`\n${match.home} vs ${match.away} (Tip: ${match.tip})`)
    
    if (data.results) {
      const event = data.results.find(r => r.type === 'event')?.entity
      if (event && event.status?.type === 'finished') {
        const homeScore = event.homeScore?.display || event.homeScore?.current || 0
        const awayScore = event.awayScore?.display || event.awayScore?.current || 0
        console.log(`  Score: ${homeScore}-${awayScore}`)
        
        // Check if tip won
        let result = 'LOST'
        if (match.tip === '1X' && homeScore >= awayScore) result = 'WON'
        else if (match.tip === 'X2' && awayScore >= homeScore) result = 'WON'
        else if (match.tip === '12' && homeScore !== awayScore) result = 'WON'
        
        console.log(`  Result: ${result}`)
        console.log(`  Logic: ${match.tip} tip - Home: ${homeScore}, Away: ${awayScore}`)
        
        if (match.tip === '1X') {
          console.log(`  1X means: Home Win OR Draw - ${homeScore >= awayScore ? '✅ CORRECT' : '❌ WRONG'}`)
        } else if (match.tip === 'X2') {
          console.log(`  X2 means: Draw OR Away Win - ${awayScore >= homeScore ? '✅ CORRECT' : '❌ WRONG'}`)
        }
      } else {
        console.log('  Match not found or not finished')
      }
    }
    
    await new Promise(r => setTimeout(r, 2000))
  } catch (error) {
    console.log(`  Error: ${error.message}`)
  }
}
