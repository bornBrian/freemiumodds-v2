import express from 'express'
import { supabase, isSupabaseConfigured } from '../config/supabase.js'
import { fetchOddsFromAPI, extract1X2Odds } from '../services/oddsAPI.js'
import { toDoubleChanceOdds } from '../utils/oddsConverter.js'
import runAutoUpdate from '../../auto-update-oddslot.js'
import { fetchMatchResult } from '../services/multiApiResults.js'

const router = express.Router()

/**
 * GET/POST /api/scheduler/update
 * Trigger Oddslot auto-update + fetch any new matches (used by Vercel Cron)
 */
router.all('/update', async (req, res) => {
  try {
    console.log('🔄 [SCHEDULER] Auto-update triggered at', new Date().toISOString())
    
    let newMatchesCount = 0
    
    // Step 1: Check for and fetch any NEW matches for today that aren't in database yet
    if (isSupabaseConfigured()) {
      try {
        console.log('📅 [SCHEDULER] Checking for new matches...')
        const today = new Date().toISOString().split('T')[0]
        
        // Fetch odds from API for today
        const oddsData = await fetchOddsFromAPI(today)
        
        if (oddsData && oddsData.length > 0) {
          console.log(`📊 [SCHEDULER] Found ${oddsData.length} matches from API`)
          
          // Get existing match IDs from database
          const { data: existingMatches } = await supabase
            .from('matches')
            .select('provider_match_id')
            .gte('kickoff', today)
            .lt('kickoff', new Date(Date.now() + 86400000).toISOString().split('T')[0])
          
          const existingIds = new Set(existingMatches?.map(m => m.provider_match_id) || [])
          
          // Find NEW matches not in database
          const newMatches = oddsData.filter(event => !existingIds.has(event.id))
          
          if (newMatches.length > 0) {
            console.log(`✨ [SCHEDULER] Found ${newMatches.length} NEW matches to add`)
            
            // Add new matches to database
            for (const event of newMatches) {
              const odds1X2 = extract1X2Odds(event.bookmakers)
              if (!odds1X2) continue
              
              const doubleChance = toDoubleChanceOdds(odds1X2)
              
              const matchData = {
                provider_match_id: event.id,
                home: event.home_team,
                away: event.away_team,
                league: event.sport_title || event.sport_key,
                kickoff: event.commence_time,
                status: 'pending',
                confidence: 84,
                tip: null,
                double_chance: doubleChance,
                bookmaker: odds1X2.bookmaker,
                created_at: new Date().toISOString()
              }
              
              await supabase
                .from('matches')
                .upsert(matchData, { onConflict: 'provider_match_id' })
              
              newMatchesCount++
            }
            
            console.log(`✅ [SCHEDULER] Added ${newMatchesCount} new matches`)
          } else {
            console.log('✅ [SCHEDULER] No new matches found')
          }
        }
      } catch (fetchError) {
        console.error('⚠️  [SCHEDULER] Error fetching new matches:', fetchError.message)
        // Continue with Oddslot update even if fetch fails
      }
    }
    
    // Step 2: Run the Oddslot auto-update for all matches
    await runAutoUpdate()
    
    console.log('✅ [SCHEDULER] Auto-update completed successfully')
    
    res.json({ 
      success: true, 
      message: 'Auto-update completed',
      newMatchesAdded: newMatchesCount,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ [SCHEDULER] Auto-update failed:', error)
    res.status(500).json({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * POST /api/scheduler/fetch-daily
 * Manually trigger daily match fetch
 * In production, call this via cron or serverless scheduler
 */
router.post('/fetch-daily', async (req, res) => {
  try {
    const date = req.body.date || new Date().toISOString().split('T')[0]
    
    console.log(`📅 Fetching matches for ${date}...`)
    
    // Step 1: Fetch odds from API
    const oddsData = await fetchOddsFromAPI(date)
    
    if (!oddsData || oddsData.length === 0) {
      return res.json({ 
        message: 'No matches found or API not configured',
        matchesProcessed: 0
      })
    }
    
    const processedMatches = []
    
    // Step 2: Process each match
    for (const event of oddsData) {
      try {
        // Extract 1X2 odds
        const odds1X2 = extract1X2Odds(event.bookmakers)
        
        if (!odds1X2) {
          console.warn(`⚠️  No valid odds for ${event.home_team} vs ${event.away_team}`)
          continue
        }
        
        // Convert to double chance
        const doubleChance = toDoubleChanceOdds(odds1X2)
        
        // Prepare match data
        const matchData = {
          provider_match_id: event.id,
          home: event.home_team,
          away: event.away_team,
          league: event.sport_title || event.sport_key,
          kickoff: event.commence_time,
          status: 'pending',
          confidence: 84, // Default, can be overridden by Oddslot data
          tip: null, // To be filled by Oddslot tips
          double_chance: doubleChance,
          bookmaker: odds1X2.bookmaker,
          created_at: new Date().toISOString()
        }
        
        // Step 3: Save to database or collect
        if (isSupabaseConfigured()) {
          const { data, error } = await supabase
            .from('matches')
            .upsert(matchData, { onConflict: 'provider_match_id' })
          
          if (error) {
            console.error('Error saving match:', error)
          } else {
            processedMatches.push(data)
          }
        } else {
          processedMatches.push(matchData)
        }
        
      } catch (err) {
        console.error(`Error processing match ${event.id}:`, err)
      }
    }
    
    res.json({
      message: 'Daily fetch completed',
      matchesProcessed: processedMatches.length,
      date,
      source: isSupabaseConfigured() ? 'database' : 'mock'
    })
    
  } catch (error) {
    console.error('Error in /fetch-daily:', error)
    res.status(500).json({ error: 'Failed to fetch daily matches' })
  }
})

/**
 * POST /api/scheduler/update-statuses
 * Update match statuses (won/lost/live)
 * Call this periodically to check match results
 */
router.post('/update-statuses', async (req, res) => {
  try {
    // This would fetch live scores and update match statuses
    // For free hosting, you might want to use:
    // - API-FOOTBALL (limited free tier)
    // - LiveScore API
    // - Or scrape results after matches end
    
    res.json({ 
      message: 'Status update endpoint (implement with live scores API)',
      note: 'Consider using API-FOOTBALL free tier or similar'
    })
    
  } catch (error) {
    console.error('Error updating statuses:', error)
    res.status(500).json({ error: 'Failed to update statuses' })
  }
})

/**
 * GET/POST /api/scheduler/update-results
 * AUTO-UPDATE match results from MULTIPLE APIs (for Vercel Cron)
 */
router.all('/update-results', async (req, res) => {
  try {
    console.log('🔄 [RESULTS] Auto-updating results from MULTIPLE APIs at', new Date().toISOString())
    
    if (!isSupabaseConfigured()) {
      return res.json({ message: 'Database not configured', updated: 0 })
    }

    // API Keys
    const apiKeys = {
      rapidapi: process.env.RAPIDAPI_KEY,
      footballData: process.env.FOOTBALL_DATA_ORG_KEY,
      apiFootball: process.env.API_FOOTBALL_KEY
    }

    // Get matches that should be finished (2+ hours after kickoff)
    const twoHoursAgo = new Date(Date.now() - 120 * 60 * 1000).toISOString()
    const { data: matches, error: fetchError } = await supabase
      .from('matches')
      .select('*')
      .eq('status', 'pending')
      .lt('kickoff', twoHoursAgo)
      .limit(50) // Process max 50 matches per run

    if (fetchError) {
      throw fetchError
    }

    if (!matches || matches.length === 0) {
      console.log('✅ [RESULTS] No matches need updating')
      return res.json({ message: 'No matches to update', updated: 0 })
    }

    console.log(`📊 [RESULTS] Processing ${matches.length} matches`)

    let updated = 0
    let won = 0
    let lost = 0
    let noData = 0
    const sources = {}
    
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    // Process matches using multi-API fetcher
    for (const match of matches) {
      try {
        const result = await fetchMatchResult(match, apiKeys)
        
        if (result) {
          const finalScore = `${result.homeScore}-${result.awayScore}`
          
          // Validate prediction
          const tip = match.tip || match.best_pick
          let predictionResult = 'lost'
          
          if (tip === '1X' && result.homeScore >= result.awayScore) predictionResult = 'won'
          else if (tip === 'X2' && result.awayScore >= result.homeScore) predictionResult = 'won'
          else if (tip === '12' && result.homeScore !== result.awayScore) predictionResult = 'won'
          
          // Update database
          await supabase
            .from('matches')
            .update({
              status: 'completed',
              result: predictionResult,
              final_score: finalScore
            })
            .eq('id', match.id)
          
          updated++
          if (predictionResult === 'won') won++
          else lost++
          
          // Track which API provided the result
          sources[result.source] = (sources[result.source] || 0) + 1
          
          console.log(`   ${predictionResult === 'won' ? '✅' : '❌'} ${match.home} vs ${match.away}: ${finalScore} (${result.source})`)
        } else if (match.kickoff < twentyFourHoursAgo) {
          // If no result after 24 hours, mark as no_data (don't count in win rate)
          await supabase
            .from('matches')
            .update({
              status: 'no_data',
              result: 'no_data',
              final_score: null
            })
            .eq('id', match.id)
          
          noData++
          console.log(`   ⚠️  ${match.home} vs ${match.away}: No data available (24h+)`)
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 800))
        
      } catch (err) {
        console.error(`Error processing match ${match.id}:`, err.message)
      }
    }

    console.log(`✅ [RESULTS] Updated ${updated} matches (Won: ${won}, Lost: ${lost}, No Data: ${noData})`)
    console.log(`📡 [SOURCES]`, sources)
    
    res.json({ 
      success: true,
      updated,
      won,
      lost,
      noData,
      winRate: updated > 0 ? Math.round((won / updated) * 100) : 0,
      sources,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ [RESULTS] Update failed:', error)
    res.status(500).json({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
})

export default router

