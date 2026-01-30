/**
 * Test what leagues/matches the APIs actually have
 */
import fetch from 'node-fetch'
import 'dotenv/config'

console.log('🔍 Testing API-Football for real match data...\n')

const API_KEY = process.env.API_FOOTBALL_KEY

// Test today's fixtures
const today = new Date().toISOString().split('T')[0]
console.log(`Fetching fixtures for: ${today}\n`)

try {
  const response = await fetch(`https://v3.football.api-sports.io/fixtures?date=${today}`, {
    headers: { 'x-apisports-key': API_KEY }
  })
  
  const data = await response.json()
  
  console.log(`API Response Status: ${data.response ? 'SUCCESS' : 'FAILED'}`)
  console.log(`Total fixtures today: ${data.results || 0}\n`)
  
  if (data.response && data.response.length > 0) {
    console.log('📊 Sample matches available:\n')
    data.response.slice(0, 10).forEach(match => {
      const status = match.fixture.status.short
      const home = match.teams.home.name
      const away = match.teams.away.name
      const league = match.league.name
      const score = match.goals.home !== null ? `${match.goals.home}-${match.goals.away}` : 'Not started'
      
      console.log(`${status} | ${home} vs ${away}`)
      console.log(`   League: ${league}`)
      console.log(`   Score: ${score}`)
      console.log('')
    })
  } else {
    console.log('❌ No fixtures found or API error')
    console.log('Error:', data.message || data.errors)
  }
} catch (error) {
  console.error('❌ API call failed:', error.message)
}
