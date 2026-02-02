/**
 * Debug why matches weren't found
 */
import { createClient } from '@supabase/supabase-js'
import fetch from 'node-fetch'
import 'dotenv/config'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

// Test with matches that SHOULD be in SofaScore but weren't found
const testMatches = [
  { home: 'Gyor', away: 'Debrecen', kickoff: '2026-01-31T15:00:00' },
  { home: 'Waregem W', away: 'RSC Anderlecht W', kickoff: '2026-01-31T15:00:00' },
  { home: 'Goztepe', away: 'Karagumruk', kickoff: '2026-01-31T17:00:00' }
]

for (const match of testMatches) {
  console.log(`\n${'='.repeat(70)}`)
  console.log(`Testing: ${match.home} vs ${match.away}`)
  console.log('='.repeat(70))
  
  // Try different search strategies
  const queries = [
    `${match.home} ${match.away}`,
    match.home,
    `${match.home} vs ${match.away}`
  ]
  
  for (const query of queries) {
    console.log(`\nQuery: "${query}"`)
    const searchUrl = `https://www.sofascore.com/api/v1/search/all?q=${encodeURIComponent(query)}`
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      }
    })
    
    const data = await response.json()
    const events = data.results?.filter(r => r.type === 'event') || []
    
    console.log(`Found ${events.length} events`)
    
    if (events.length > 0) {
      const matchTimestamp = new Date(match.kickoff).getTime()
      
      for (let i = 0; i < Math.min(3, events.length); i++) {
        const event = events[i].entity
        const eventTimestamp = event.startTimestamp * 1000
        const timeDiff = Math.abs(eventTimestamp - matchTimestamp) / 1000 / 60 / 60
        
        console.log(`  ${i + 1}. ${event.homeTeam?.name} vs ${event.awayTeam?.name}`)
        console.log(`     Status: ${event.status?.type}`)
        console.log(`     Score: ${event.homeScore?.display ?? '?'}-${event.awayScore?.display ?? '?'}`)
        console.log(`     Date: ${new Date(eventTimestamp).toLocaleString()}`)
        console.log(`     Time diff: ${timeDiff.toFixed(1)} hours`)
      }
      
      // If we found it, break
      if (events.length > 0) break
    }
    
    await new Promise(resolve => setTimeout(resolve, 1500))
  }
}
