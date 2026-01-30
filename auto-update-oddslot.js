/**
 * AUTO-UPDATE SYSTEM WITH ODDSLOT SCRAPING
 * 1. Scrapes Oddslot.com for 81%+ predictions
 * 2. Converts to double chance
 * 3. Fetches real odds from The Odds API
 * 4. Updates results from livescore
 */

import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import fetch from 'node-fetch'
import { scrapeOddslotPredictions, convertToDoubleChance, findMatchOdds, scrapeSportybetOdds, scrapeSportybetOddsForMatches } from './api/services/oddslotScraper.js'
import { checkOddsAPIResult, validateDoubleChance } from './api/services/livescoreService.js'

dotenv.config()

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)
const ODDS_API_KEY = process.env.ODDS_API_KEY

// Calculate double chance odds
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

// 1. FETCH MATCHES FROM ODDSLOT (81%+ confidence)
export async function fetchMatchesFromOddslot() {
  console.log('🎯 [ODDSLOT] Fetching predictions with 81%+ confidence from Oddslot.com...')
  
  // Scrape Oddslot for predictions
  const predictions = await scrapeOddslotPredictions()
  
  if (predictions.length === 0) {
    console.log('⚠️  [ODDSLOT] No predictions found, falling back to Odds API')
    return await fetchFromOddsAPIDirectly()
  }
  
  const processedMatches = []
  
  // Try to get Sportybet odds for ALL matches at once (efficient batch scraping)
  console.log(`🌐 Attempting to fetch Sportybet odds for all ${predictions.length} matches...`)
  const sportybetResults = await scrapeSportybetOddsForMatches(predictions)
  
  for (let i = 0; i < predictions.length; i++) {
    const pred = predictions[i]
    const sportybetData = sportybetResults[i]
    
    try {
      // Convert Oddslot prediction to double chance
      const doubleChanceTip = convertToDoubleChance(pred.prediction)
      
      const sportybetOdds = sportybetData?.odds
      
      // Then try The Odds API if Sportybet fails
      const oddsData = await findMatchOdds(pred.home, pred.away, ODDS_API_KEY)
      await new Promise(resolve => setTimeout(resolve, 100)) // 100ms delay between calls
      
      let matchData
      
      if (sportybetOdds && sportybetOdds['1X'] && sportybetOdds['X2'] && sportybetOdds['12']) {
        // Use real Sportybet double chance odds
        console.log(`✅ Real odds from Sportybet for ${pred.home} vs ${pred.away}`)
        
        matchData = {
          provider_match_id: `sportybet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          home: pred.home,
          away: pred.away,
          league: pred.league,
          kickoff: pred.kickoff,
          status: 'pending',
          confidence: pred.confidence,
          tip: doubleChanceTip,
          best_pick: doubleChanceTip,
          double_chance: sportybetOdds,
          bookmaker: 'Sportybet',
          created_at: new Date().toISOString()
        }
      } else if (oddsData && oddsData.homeOdd && oddsData.drawOdd && oddsData.awayOdd) {
        // Calculate REAL double chance odds from Odds API h2h odds
        const doubleChanceOdds = toDoubleChanceOdds({
          homeOdd: oddsData.homeOdd,
          drawOdd: oddsData.drawOdd,
          awayOdd: oddsData.awayOdd
        })
        
        console.log(`✅ Real odds found for ${pred.home} vs ${pred.away} from ${oddsData.bookmaker}`)
        
        matchData = {
          provider_match_id: oddsData.matchId,
          home: pred.home,
          away: pred.away,
          league: pred.league,
          kickoff: oddsData.kickoff,
          status: 'pending',
          confidence: pred.confidence,
          tip: doubleChanceTip,
          best_pick: doubleChanceTip,
          double_chance: doubleChanceOdds,
          bookmaker: oddsData.bookmaker,
          created_at: new Date().toISOString()
        }
      } else {
        // No odds found - use approximated odds based on confidence
        console.log(`⚠️  No real odds found for ${pred.home} vs ${pred.away} - using confidence-based odds`)
        
        // Approximation: confidence represents the double chance win probability
        // For 83% confidence DC bet, the fair odd would be 1/0.83 = 1.20
        // We apply a margin to make it realistic (bookmakers always have margin)
        const confidenceDecimal = pred.confidence / 100
        const margin = 0.90 // 90% of fair value (bookmaker margin)
        
        // Calculate fair double chance odd and apply margin
        const fairDCOdd = 1 / confidenceDecimal
        const dcOdd = Math.max(1.01, Number((fairDCOdd * margin).toFixed(2)))
        
        const approximateDoubleChanceOdds = {
          '1X': dcOdd,  // Main double chance odd
          'X2': dcOdd,  // Same for opposite DC
          '12': Math.max(1.01, Number((dcOdd * 0.85).toFixed(2))) // Slightly lower for both teams
        }
        
        console.log(`   Approx DC odds: 1X=${approximateDoubleChanceOdds['1X']}, X2=${approximateDoubleChanceOdds['X2']}, 12=${approximateDoubleChanceOdds['12']}`)
        
        matchData = {
          provider_match_id: `oddslot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          home: pred.home,
          away: pred.away,
          league: pred.league,
          kickoff: pred.kickoff,
          status: 'pending',
          confidence: pred.confidence,
          tip: doubleChanceTip,
          best_pick: doubleChanceTip,
          double_chance: approximateDoubleChanceOdds,
          bookmaker: 'Approximated',
          created_at: new Date().toISOString()
        }
      }
      
      processedMatches.push(matchData)
      console.log(`✅ ${pred.home} vs ${pred.away} | Tip: ${doubleChanceTip} | Confidence: ${pred.confidence}%`)
      
    } catch (error) {
      console.error(`❌ Error processing ${pred.home} vs ${pred.away}:`, error.message)
    }
  }
  
  // Save to database
  if (processedMatches.length > 0) {
    // Check which matches already exist
    const { data: existingMatches } = await supabase
      .from('matches')
      .select('home, away')
    
    const existingKeys = new Set(
      existingMatches?.map(m => `${m.home}|${m.away}`) || []
    )
    
    // Filter out matches that already exist
    const newMatches = processedMatches.filter(
      m => !existingKeys.has(`${m.home}|${m.away}`)
    )
    
    if (newMatches.length === 0) {
      console.log('✅ [ODDSLOT] All matches already in database')
      return processedMatches.length
    }
    
    const { error } = await supabase
      .from('matches')
      .insert(newMatches)
    
    if (error) {
      console.error('❌ Error saving matches:', error.message)
    } else {
      console.log(`✅ [ODDSLOT] Saved ${newMatches.length} NEW matches to database`)
    }
  }
  
  return processedMatches.length
}

// Fallback: Fetch directly from Odds API if Oddslot scraping fails
async function fetchFromOddsAPIDirectly() {
  console.log('📊 [FALLBACK] Fetching from Odds API directly...')
  
  const sports = ['soccer_epl', 'soccer_spain_la_liga', 'soccer_germany_bundesliga', 'soccer_italy_serie_a']
  let totalMatches = 0
  
  for (const sport of sports) {
    try {
      const url = `https://api.the-odds-api.com/v4/sports/${sport}/odds/?apiKey=${ODDS_API_KEY}&regions=eu&markets=h2h&oddsFormat=decimal`
      const response = await fetch(url)
      
      if (!response.ok) continue
      
      const data = await response.json()
      
      for (const match of data) {
        const bookmaker = match.bookmakers[0]
        if (!bookmaker) continue
        
        const h2hMarket = bookmaker.markets.find(m => m.key === 'h2h')
        if (!h2hMarket || h2hMarket.outcomes.length < 3) continue
        
        const homeOdd = h2hMarket.outcomes.find(o => o.name === match.home_team)?.price
        const awayOdd = h2hMarket.outcomes.find(o => o.name === match.away_team)?.price
        const drawOdd = h2hMarket.outcomes.find(o => o.name === 'Draw')?.price
        
        if (!homeOdd || !drawOdd || !awayOdd) continue
        
        const doubleChance = toDoubleChanceOdds({ homeOdd, drawOdd, awayOdd })
        
        // Pick lowest odds as best value
        let bestPick = '1X'
        let lowestOdd = doubleChance['1X']
        if (doubleChance['X2'] < lowestOdd) {
          bestPick = 'X2'
          lowestOdd = doubleChance['X2']
        }
        if (doubleChance['12'] < lowestOdd) {
          bestPick = '12'
        }
        
        const matchData = {
          provider_match_id: match.id,
          home: match.home_team,
          away: match.away_team,
          league: sport.replace(/_/g, ' ').toUpperCase(),
          kickoff: match.commence_time,
          status: 'pending',
          confidence: 81,
          tip: bestPick,
          best_pick: bestPick,
          double_chance: doubleChance,
          bookmaker: bookmaker.title,
          created_at: new Date().toISOString()
        }
        
        await supabase
          .from('matches')
          .upsert(matchData, { onConflict: 'provider_match_id' })
        
        totalMatches++
      }
    } catch (error) {
      console.error(`❌ Error fetching ${sport}:`, error.message)
    }
  }
  
  console.log(`✅ [FALLBACK] Fetched ${totalMatches} matches`)
  return totalMatches
}

// 2. UPDATE MATCH RESULTS FROM LIVE SCORES - Check matches that finished within last 3 hours
export async function updateMatchResults() {
  console.log('🏁 [RESULTS] Updating match results from live scores...')
  
  // Get matches that should be completed (kickoff time passed + at least 90 minutes)
  const now = new Date()
  const threeHoursAgo = new Date(now - 3 * 60 * 60 * 1000).toISOString()
  const ninetyMinutesAgo = new Date(now - 110 * 60 * 1000).toISOString() // 110 mins for extra time
  
  const { data: pendingMatches } = await supabase
    .from('matches')
    .select('*')
    .eq('status', 'pending')
    .lt('kickoff', ninetyMinutesAgo) // Must have started at least 110 minutes ago
    .gt('kickoff', threeHoursAgo) // But not more than 3 hours ago
  
  if (!pendingMatches || pendingMatches.length === 0) {
    console.log('✅ [RESULTS] No matches to update')
    return 0
  }
  
  console.log(`🔍 [RESULTS] Checking ${pendingMatches.length} matches for results...`)
  
  let updated = 0
  
  for (const match of pendingMatches) {
    try {
      // Try to get result from Odds API scores endpoint
      const result = await checkOddsAPIResult(match.provider_match_id, ODDS_API_KEY)
      
      if (result && result.status === 'completed') {
        // Validate if our double chance prediction was correct
        const isCorrect = validateDoubleChance(match.tip, result.result)
        
        await supabase
          .from('matches')
          .update({
            status: 'completed',
            final_score: `${result.homeScore}-${result.awayScore}`,
            result: isCorrect ? 'won' : 'lost',
            actual_result: result.result // '1', 'X', or '2'
          })
          .eq('id', match.id)
        
        console.log(`${isCorrect ? '✅' : '❌'} ${match.home} vs ${match.away}: ${result.homeScore}-${result.awayScore} | Tip: ${match.tip} | ${isCorrect ? 'WON' : 'LOST'}`)
        updated++
      }
    } catch (error) {
      console.error(`❌ Error updating ${match.home} vs ${match.away}:`, error.message)
    }
  }
  
  console.log(`✅ [RESULTS] Updated ${updated} match results`)
  return updated
}

// 3. CALCULATE REAL STATS
export async function calculateRealStats() {
  const { data: completedMatches } = await supabase
    .from('matches')
    .select('result')
    .eq('status', 'completed')
  
  if (!completedMatches || completedMatches.length === 0) {
    return { winRate: 0, successRate: 0, total: 0 }
  }
  
  const won = completedMatches.filter(m => m.result === 'won').length
  const total = completedMatches.length
  
  return {
    winRate: Math.round((won / total) * 100),
    successRate: Math.round((won / total) * 100),
    total: total
  }
}

// RUN ALL UPDATES
async function runAutoUpdate() {
  console.log('\n========================================')
  console.log('🤖 AUTO-UPDATE STARTED (ODDSLOT MODE)')
  console.log('========================================\n')
  
  await fetchMatchesFromOddslot()
  await updateMatchResults()
  const stats = await calculateRealStats()
  
  console.log('\n📊 Current Stats:')
  console.log(`   Win Rate: ${stats.winRate}%`)
  console.log(`   Success Rate: ${stats.successRate}%`)
  console.log(`   Completed Matches: ${stats.total}`)
  
  console.log('\n========================================')
  console.log('✅ AUTO-UPDATE COMPLETE')
  console.log('========================================\n')
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAutoUpdate()
}

export default runAutoUpdate
