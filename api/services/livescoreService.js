/**
 * LIVE SCORE SERVICE
 * Fetches match results from livescore/sofascore APIs
 */

import fetch from 'node-fetch'

/**
 * Fetch match result from API-Football (free tier available)
 */
export async function fetchMatchResult(homeTeam, awayTeam, kickoffDate) {
  try {
    // Option 1: API-Football (https://www.api-football.com/) - Free tier: 100 requests/day
    // You'll need to sign up and get an API key
    
    // Option 2: Football-Data.org (free tier: 10 requests/minute)
    // const apiKey = process.env.FOOTBALL_DATA_API_KEY
    
    // Option 3: TheSportsDB (free, no key needed)
    const searchUrl = `https://www.thesportsdb.com/api/v1/json/3/searchevents.php?e=${encodeURIComponent(homeTeam + ' vs ' + awayTeam)}`
    
    const response = await fetch(searchUrl)
    if (!response.ok) return null
    
    const data = await response.json()
    
    if (data.event && data.event.length > 0) {
      const match = data.event[0]
      
      // Check if match is finished
      if (match.strStatus === 'Match Finished' || match.intHomeScore !== null) {
        return {
          homeScore: parseInt(match.intHomeScore),
          awayScore: parseInt(match.intAwayScore),
          status: 'completed',
          result: match.intHomeScore > match.intAwayScore ? '1' : 
                  match.intAwayScore > match.intHomeScore ? '2' : 'X'
        }
      }
    }
    
    return null
  } catch (error) {
    console.error(`Error fetching result for ${homeTeam} vs ${awayTeam}:`, error.message)
    return null
  }
}

/**
 * Alternative: Scrape livescore.com for match results
 */
export async function scrapeLivescoreResult(homeTeam, awayTeam) {
  try {
    // Note: Web scraping may violate terms of service
    // Better to use official APIs
    
    const url = 'https://www.livescore.com/en/'
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    // Parse response and find match
    // This is complex and may break if site structure changes
    
    return null
  } catch (error) {
    console.error('Error scraping livescore:', error.message)
    return null
  }
}

/**
 * Check if match result is available from The Odds API scores endpoint
 */
export async function checkOddsAPIResult(matchId, apiKey) {
  try {
    const url = `https://api.the-odds-api.com/v4/sports/soccer_epl/scores/?apiKey=${apiKey}&daysFrom=3`
    const response = await fetch(url)
    
    if (!response.ok) return null
    
    const scores = await response.json()
    const matchScore = scores.find(s => s.id === matchId)
    
    if (matchScore && matchScore.completed) {
      const homeScore = matchScore.scores?.find(s => s.name === matchScore.home_team)?.score
      const awayScore = matchScore.scores?.find(s => s.name === matchScore.away_team)?.score
      
      if (homeScore !== undefined && awayScore !== undefined) {
        return {
          homeScore: parseInt(homeScore),
          awayScore: parseInt(awayScore),
          status: 'completed',
          result: homeScore > awayScore ? '1' : awayScore > homeScore ? '2' : 'X'
        }
      }
    }
    
    return null
  } catch (error) {
    console.error('Error checking Odds API result:', error.message)
    return null
  }
}

/**
 * Validate if double chance prediction was correct
 */
export function validateDoubleChance(doubleChanceTip, actualResult) {
  const validResults = {
    '1X': ['1', 'X'],
    'X2': ['X', '2'],
    '12': ['1', '2']
  }
  
  return validResults[doubleChanceTip]?.includes(actualResult) || false
}

export default {
  fetchMatchResult,
  checkOddsAPIResult,
  scrapeLivescoreResult,
  validateDoubleChance
}
