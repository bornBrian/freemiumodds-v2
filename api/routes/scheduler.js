import express from 'express'
import { supabase, isSupabaseConfigured } from '../config/supabase.js'
import { fetchOddsFromAPI, extract1X2Odds } from '../services/oddsAPI.js'
import { toDoubleChanceOdds } from '../utils/oddsConverter.js'
import runAutoUpdate from '../../auto-update-oddslot.js'

const router = express.Router()

/**
 * GET/POST /api/scheduler/update
 * Trigger Oddslot auto-update (used by Vercel Cron)
 */
router.all('/update', async (req, res) => {
  try {
    console.log('🔄 [SCHEDULER] Auto-update triggered at', new Date().toISOString())
    
    // Run the auto-update
    await runAutoUpdate()
    
    console.log('✅ [SCHEDULER] Auto-update completed successfully')
    
    res.json({ 
      success: true, 
      message: 'Auto-update completed',
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

export default router
