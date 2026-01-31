import express from 'express'
import { supabase, isSupabaseConfigured } from '../config/supabase.js'
import { fetchOddsFromAPI, extract1X2Odds } from '../services/oddsAPI.js'
import { toDoubleChanceOdds } from '../utils/oddsConverter.js'
import runAutoUpdate from '../../auto-update-oddslot.js'

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
 * AUTO-UPDATE match results from SofaScore (for Vercel Cron)
 */
router.all('/update-results', async (req, res) => {
  try {
    console.log('🔄 [RESULTS] Auto-updating results at', new Date().toISOString())
    
    if (!isSupabaseConfigured()) {
      return res.json({ message: 'Database not configured', updated: 0 })
    }

    // Get matches that should be finished (2+ hours after kickoff)
    const twoHoursAgo = new Date(Date.now() - 120 * 60 * 1000).toISOString()
    const { data: matches, error: fetchError } = await supabase
      .from('matches')
      .select('*')
      .eq('status', 'pending')
      .lt('kickoff', twoHoursAgo)
      .limit(20) // Process max 20 matches per run to stay within timeout

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

    // Helper functions for smart team matching
    const normalizeTeam = (name) => {
      const nameMap = {
        'real madrid b': 'real madrid castilla',
        'barcelona b': 'barcelona athletic',
        'atletico madrid b': 'atletico madrid b',
        'osasuna b': 'osasuna promesas',
        'din. bucuresti': 'dinamo bucuresti',
        'dinamo bucuresti': 'fc dinamo bucuresti',
        'cfr cluj': 'cfr 1907 cluj',
        'istanbulspor as': 'istanbulspor',
        'airdrieonians': 'airdrie',
      }
      
      const lower = name.toLowerCase().trim()
      if (nameMap[lower]) return nameMap[lower]
      
      return lower
        .replace(/\s+fc\s*/gi, '')
        .replace(/\s+cf\s*/gi, '')
        .replace(/\s+sc\s*/gi, '')
        .replace(/\s+as\s*/gi, '')
        .replace(/\s+bk\s*/gi, '')
        .replace(/[^\w\s]/g, '')
        .trim()
    }

    const teamsMatch = (searchName, resultName) => {
      const search = normalizeTeam(searchName)
      const result = normalizeTeam(resultName)
      
      if (search === result) return true
      
      const searchWords = search.split(' ').filter(w => w.length > 2)
      const resultWords = result.split(' ').filter(w => w.length > 2)
      
      let matches = 0
      for (const sw of searchWords) {
        for (const rw of resultWords) {
          if (sw.includes(rw) || rw.includes(sw)) matches++
        }
      }
      return matches >= Math.min(2, searchWords.length)
    }

    // Process matches
    for (const match of matches) {
      try {
        // Try multiple search strategies
        const searchQueries = [
          `${match.home} ${match.away}`,
          match.home,
          match.away
        ]
        
        let eventId = null
        const matchDate = new Date(match.kickoff).toISOString().split('T')[0]
        
        for (const query of searchQueries) {
          if (eventId) break
          
          const searchQuery = encodeURIComponent(query)
          const searchUrl = `https://www.sofascore.com/api/v1/search/all?q=${searchQuery}`
          
          const response = await fetch(searchUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Accept': 'application/json'
            }
          })
          
          if (!response.ok) continue
          
          const data = await response.json()
          
          // Find match in results with fuzzy matching
          if (data.results) {
            for (const result of data.results) {
              if (result.type === 'event' && result.entity) {
                const event = result.entity
                const eventDate = new Date(event.startTimestamp * 1000).toISOString().split('T')[0]
                
                if (eventDate === matchDate && event.status?.type === 'finished') {
                  const homeMatch = teamsMatch(match.home, event.homeTeam?.name || '')
                  const awayMatch = teamsMatch(match.away, event.awayTeam?.name || '')
                
                  if (homeMatch && awayMatch) {
                    eventId = event.id
                    break
                  }
                }
              }
            }
          }
          
          // Small delay between searches
          await new Promise(resolve => setTimeout(resolve, 300))
        }
        
        // Get detailed score
        if (eventId) {
          const detailUrl = `https://www.sofascore.com/api/v1/event/${eventId}`
          const detailResponse = await fetch(detailUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Accept': 'application/json'
            }
          })
          
          if (detailResponse.ok) {
            const matchData = await detailResponse.json()
            const event = matchData.event
            
            if (event.homeScore && event.awayScore) {
              const homeScore = event.homeScore.current || event.homeScore.display
              const awayScore = event.awayScore.current || event.awayScore.display
              const finalScore = `${homeScore}-${awayScore}`
              
              // Validate prediction
              const tip = match.tip || match.best_pick
              let result = 'lost'
              
              if (tip === '1X' && homeScore >= awayScore) result = 'won'
              else if (tip === 'X2' && awayScore >= homeScore) result = 'won'
              else if (tip === '12' && homeScore !== awayScore) result = 'won'
              
              // Update database
              await supabase
                .from('matches')
                .update({
                  status: 'completed',
                  result: result,
                  final_score: finalScore
                })
                .eq('id', match.id)
              
              updated++
              if (result === 'won') won++
              else lost++
              
              console.log(`   ${result === 'won' ? '✅' : '❌'} ${match.home} vs ${match.away}: ${finalScore}`)
            }
          }
        }
        
        // Delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1500))
        
      } catch (err) {
        console.error(`Error processing match ${match.id}:`, err.message)
      }
    }

    console.log(`✅ [RESULTS] Updated ${updated} matches (Won: ${won}, Lost: ${lost})`)
    
    res.json({ 
      success: true,
      updated,
      won,
      lost,
      winRate: updated > 0 ? Math.round((won / updated) * 100) : 0,
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

