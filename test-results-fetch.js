import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { fetchMatchResult } from './api/services/multiApiResults.js'

dotenv.config()

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

async function testResultsFetch() {
  console.log('🧪 Testing results fetch for old pending matches...\n')
  
  // Get major league matches from pending
  const twoHoursAgo = new Date(Date.now() - 120 * 60 * 1000).toISOString()
  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .eq('status', 'pending')
    .lt('kickoff', twoHoursAgo)
    .or('league.ilike.%epl%,league.ilike.%la liga%,league.ilike.%bundesliga%,league.ilike.%serie a%')
    .order('kickoff', { ascending: false })
    .limit(10)
  
  if (!matches || matches.length === 0) {
    console.log('No matches found')
    return
  }
  
  const apiKeys = {
    rapidapi: process.env.RAPIDAPI_KEY,
    footballData: process.env.FOOTBALL_DATA_ORG_KEY,
    apiFootball: process.env.API_FOOTBALL_KEY
  }
  
  console.log(`Testing with ${matches.length} matches:\n`)
  
  for (const match of matches) {
    console.log(`\n📍 ${match.home} vs ${match.away}`)
    console.log(`   League: ${match.league}`)
    console.log(`   Kickoff: ${new Date(match.kickoff).toLocaleString()}`)
    
    try {
      const result = await fetchMatchResult(match, apiKeys)
      
      if (result) {
        console.log(`   ✅ Result found: ${result.homeScore}-${result.awayScore} (${result.source})`)
      } else {
        console.log(`   ❌ No result found`)
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`)
    }
    
    // Delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
}

testResultsFetch()
