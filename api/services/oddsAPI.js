/**
 * Fetch matches from TheOddsAPI (free tier: 500 requests/month)
 * Docs: https://the-odds-api.com/liveapi/guides/v4/
 */
export async function fetchOddsFromAPI(date) {
  const apiKey = process.env.ODDS_API_KEY
  
  if (!apiKey) {
    console.warn('⚠️  ODDS_API_KEY not configured')
    return []
  }

  try {
    const sport = 'soccer_epl' // Example: English Premier League
    const markets = 'h2h' // Head to head (1X2)
    const regions = 'uk' // UK bookmakers
    
    const url = `https://api.the-odds-api.com/v4/sports/${sport}/odds/?apiKey=${apiKey}&regions=${regions}&markets=${markets}`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    // Log remaining requests (printed in response headers)
    const remaining = response.headers.get('x-requests-remaining')
    console.log(`📊 Odds API requests remaining: ${remaining}`)
    
    return data.map(event => ({
      id: event.id,
      sport: event.sport_key,
      commence_time: event.commence_time,
      home_team: event.home_team,
      away_team: event.away_team,
      bookmakers: event.bookmakers || []
    }))
    
  } catch (error) {
    console.error('Error fetching odds:', error)
    return []
  }
}

/**
 * Extract 1X2 odds from bookmaker data
 */
export function extract1X2Odds(bookmakers, preferredBookmaker = 'bet365') {
  // Find preferred bookmaker or use first available
  const bookmaker = bookmakers.find(b => b.key === preferredBookmaker) || bookmakers[0]
  
  if (!bookmaker) return null
  
  const h2hMarket = bookmaker.markets.find(m => m.key === 'h2h')
  if (!h2hMarket || h2hMarket.outcomes.length < 2) return null
  
  const outcomes = h2hMarket.outcomes
  
  // For 1X2, we need home, draw, away
  // Note: Some matches don't have draw (2-way markets)
  const home = outcomes.find(o => o.name === bookmaker.home_team)
  const away = outcomes.find(o => o.name === bookmaker.away_team)
  const draw = outcomes.find(o => o.name === 'Draw')
  
  if (!home || !away) return null
  
  return {
    homeOdd: home.price,
    drawOdd: draw?.price || 3.5, // Default draw odd if not available
    awayOdd: away.price,
    bookmaker: bookmaker.title
  }
}
