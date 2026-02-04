/**
 * FORCE FETCH TODAY'S MATCHES FROM ODDSLOT
 * More aggressive - fetches ALL matches regardless of confidence
 */

import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { scrapeOddslotPredictions } from './api/services/oddslotScraper.js'
import { scrapeSportybetOddsForMatches } from './api/services/oddslotScraper.js'

dotenv.config()

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

function toDoubleChanceOdds({ homeOdd, drawOdd, awayOdd }) {
  const homeProb = 1 / homeOdd
  const drawProb = 1 / drawOdd
  const awayProb = 1 / awayOdd
  const margin = homeProb + drawProb + awayProb - 1
  
  const fairHomeProb = homeProb / (1 + margin)
  const fairDrawProb = drawProb / (1 + margin)
  const fairAwayProb = awayProb / (1 + margin)
  
  return {
    '1X': Number((1 / (fairHomeProb + fairDrawProb)).toFixed(2)),
    'X2': Number((1 / (fairDrawProb + fairAwayProb)).toFixed(2)),
    '12': Number((1 / (fairHomeProb + fairAwayProb)).toFixed(2))
  }
}

function convertToDoubleChance(prediction) {
  const mapping = {
    '1': '1X',
    'X': '1X',
    '2': 'X2',
    'Home': '1X',
    'Draw': '1X',
    'Away': 'X2'
  }
  return mapping[prediction] || '1X'
}

async function forceFetchToday() {
  console.log('\n🔥 FORCE FETCHING TODAY\'S MATCHES FROM ODDSLOT\n')
  
  // Get predictions from Oddslot
  const predictions = await scrapeOddslotPredictions()
  
  if (predictions.length === 0) {
    console.log('❌ No predictions found on Oddslot')
    return
  }
  
  console.log(`\n✅ Found ${predictions.length} matches with 81%+ confidence\n`)
  
  // Filter for TODAY only
  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
  
  const todayMatches = predictions.filter(p => {
    const matchDate = p.kickoff.split('T')[0]
    return matchDate === today || matchDate === tomorrow
  })
  
  console.log(`📅 Matches for TODAY/TOMORROW: ${todayMatches.length}`)
  
  if (todayMatches.length === 0) {
    console.log('⚠️  No matches for today/tomorrow found')
    return
  }
  
  // Get Sportybet odds
  console.log('\n🌐 Fetching Sportybet odds...\n')
  const sportybetResults = await scrapeSportybetOddsForMatches(todayMatches)
  
  let added = 0
  
  for (let i = 0; i < todayMatches.length; i++) {
    const pred = todayMatches[i]
    const sportybetData = sportybetResults[i]
    
    const doubleChanceTip = convertToDoubleChance(pred.prediction)
    
    let matchData
    
    if (sportybetData?.odds) {
      // Use Sportybet odds
      matchData = {
        provider_match_id: `oddslot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        home: pred.home,
        away: pred.away,
        league: pred.league,
        kickoff: pred.kickoff,
        status: 'pending',
        confidence: Math.round(pred.confidence),
        tip: doubleChanceTip,
        best_pick: doubleChanceTip,
        double_chance: sportybetData.odds,
        bookmaker: 'Sportybet',
        created_at: new Date().toISOString()
      }
    } else {
      // Use estimated odds (1.5 for all)
      matchData = {
        provider_match_id: `oddslot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        home: pred.home,
        away: pred.away,
        league: pred.league,
        kickoff: pred.kickoff,
        status: 'pending',
        confidence: Math.round(pred.confidence),
        tip: doubleChanceTip,
        best_pick: doubleChanceTip,
        double_chance: { '1X': 1.50, 'X2': 1.50, '12': 1.50 },
        bookmaker: 'Oddslot',
        created_at: new Date().toISOString()
      }
    }
    
    // Insert to database
    const { error } = await supabase
      .from('matches')
      .upsert(matchData, { onConflict: 'provider_match_id' })
    
    if (error) {
      console.error(`❌ Error adding ${pred.home} vs ${pred.away}:`, error.message)
    } else {
      console.log(`✅ ${pred.home} vs ${pred.away} | ${doubleChanceTip} | ${pred.confidence}%`)
      added++
    }
    
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  console.log(`\n✅ Added ${added} matches to database\n`)
}

forceFetchToday()
