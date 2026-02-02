/**
 * Multi-API Results Fetcher
 * Uses multiple APIs with fallback for maximum reliability
 */
import fetch from 'node-fetch'

// Team name normalization and mapping
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
    'bayern munich': 'bayern munchen',
    'fc bayern munich': 'bayern munchen',
    'fc bayern munchen': 'bayern munchen',
    'fc bayern münchen': 'bayern munchen',
  }
  
  const lower = name.toLowerCase().trim()
  if (nameMap[lower]) return nameMap[lower]
  
  return lower
    // Remove common suffixes
    .replace(/\s+w$/i, '')  // Women's suffix
    .replace(/\s+u\d+$/i, '') // U21, U23 etc
    .replace(/\s+ii$/i, '')   // Second teams
    .replace(/\s+b$/i, '')    // B teams
    // Normalize accents and special characters FIRST
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ä/g, 'a')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    .replace(/ğ/g, 'g')
    .replace(/ş/g, 's')
    .replace(/ç/g, 'c')
    .replace(/ı/g, 'i')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')  // Remove remaining diacritics
    .replace(/münchen/g, 'munchen')
    .replace(/munich/g, 'munchen')  // English to German base
    // Remove common prefixes/suffixes
    .replace(/\s+fc\s*/gi, ' ')
    .replace(/\s+cf\s*/gi, ' ')
    .replace(/\s+sc\s*/gi, ' ')
    .replace(/\s+as\s*/gi, ' ')
    .replace(/\s+bk\s*/gi, ' ')
    .replace(/\s+sv\s*/gi, ' ')
    .replace(/\s+rsc\s*/gi, ' ')
    .replace(/\s+vsc\s*/gi, ' ')
    .replace(/^eto\s+/gi, '')  // ETO prefix
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const teamsMatch = (searchName, resultName) => {
  const search = normalizeTeam(searchName)
  const result = normalizeTeam(resultName)
  
  if (search === result) return true
  if (search.includes(result) || result.includes(search)) return true
  
  const searchWords = search.split(' ').filter(w => w.length > 2)
  const resultWords = result.split(' ').filter(w => w.length > 2)
  
  // Single word matching - be more lenient
  if (searchWords.length === 1 || resultWords.length === 1) {
    for (const sw of searchWords) {
      for (const rw of resultWords) {
        if (sw.includes(rw) || rw.includes(sw)) return true
        // Also check if first 4 characters match (handles typos)
        if (sw.length >= 4 && rw.length >= 4 && sw.substring(0, 4) === rw.substring(0, 4)) return true
      }
    }
    return false
  }
  
  // Multi-word matching - need at least 1 strong match
  let matches = 0
  for (const sw of searchWords) {
    for (const rw of resultWords) {
      if (sw === rw) matches += 2  // Exact word match is stronger
      else if (sw.includes(rw) || rw.includes(sw)) matches++
      else if (sw.length >= 4 && rw.length >= 4 && sw.substring(0, 4) === rw.substring(0, 4)) matches++
    }
  }
  return matches >= 1  // At least 1 match required
}

/**
 * Fetch from FREE SofaScore API (No API key needed!)
 */
async function fetchFromSofaScore(match) {
  try {
    // Clean team names for search (remove W suffix, extra words)
    const cleanHome = match.home.replace(/\s+W$/i, '').replace(/\s+Women$/i, '').replace(/\s+\d+$/i, '').trim()
    const cleanAway = match.away.replace(/\s+W$/i, '').replace(/\s+Women$/i, '').replace(/^H\.\s*/i, '').trim()
    
    // Extract key words (first and last words from team names)
    const homeWords = cleanHome.split(' ').filter(w => w.length > 2)
    const awayWords = cleanAway.split(' ').filter(w => w.length > 2)
    
    // Try MANY search variations for maximum coverage
    const queries = [
      `${match.home} ${match.away}`,
      `${cleanHome} ${cleanAway}`,
      `${match.away} ${match.home}`,  // Try reversed order
      `${cleanAway} ${cleanHome}`,    // Try reversed clean
      match.home,
      match.away,
      cleanHome,
      cleanAway,
      homeWords[0],  // First word of home team
      awayWords[0],  // First word of away team
      homeWords[homeWords.length - 1],  // Last word of home team
      awayWords[awayWords.length - 1]   // Last word of away team
    ].filter(q => q && q.length > 2)  // Remove empty/short queries
    
    const matchTimestamp = new Date(match.kickoff).getTime()
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000 // Very wide time window
    
    for (const query of queries) {
      const searchUrl = `https://www.sofascore.com/api/v1/search/all?q=${encodeURIComponent(query)}`
      
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      })
      
      if (!response.ok) {
        await new Promise(resolve => setTimeout(resolve, 500))
        continue
      }
      
      const data = await response.json()
      
      if (data.results) {
        for (const result of data.results) {
          if (result.type === 'event' && result.entity) {
            const event = result.entity
            
            // Check timestamp proximity
            const eventTimestamp = event.startTimestamp * 1000
            const timeDiff = Math.abs(eventTimestamp - matchTimestamp)
            
            // Must be within 7 days
            if (timeDiff <= sevenDaysMs) {
              // Try matching in BOTH orders (home/away and away/home)
              const homeMatchNormal = teamsMatch(match.home, event.homeTeam?.name || '') || 
                                     teamsMatch(cleanHome, event.homeTeam?.name || '')
              const awayMatchNormal = teamsMatch(match.away, event.awayTeam?.name || '') ||
                                     teamsMatch(cleanAway, event.awayTeam?.name || '')
              
              const homeMatchReversed = teamsMatch(match.home, event.awayTeam?.name || '') || 
                                       teamsMatch(cleanHome, event.awayTeam?.name || '')
              const awayMatchReversed = teamsMatch(match.away, event.homeTeam?.name || '') ||
                                       teamsMatch(cleanAway, event.homeTeam?.name || '')
              
              const matched = (homeMatchNormal && awayMatchNormal) || (homeMatchReversed && awayMatchReversed)
              
              if (matched && event.status?.type === 'finished') {
                // Get scores - they're in different fields for search vs detail
                let homeScore = event.homeScore?.current ?? event.homeScore?.display
                let awayScore = event.awayScore?.current ?? event.awayScore?.display
                
                // If we have valid scores from search, return immediately
                if (homeScore !== undefined && awayScore !== undefined) {
                  return {
                    source: 'SofaScore (Free API)',
                    homeScore: parseInt(homeScore),
                    awayScore: parseInt(awayScore),
                    status: 'finished'
                  }
                }
                
                // Otherwise fetch details
                const detailUrl = `https://www.sofascore.com/api/v1/event/${event.id}`
                
                const detailResponse = await fetch(detailUrl, {
                  headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'application/json'
                  }
                })
                
                if (detailResponse.ok) {
                  const matchData = await detailResponse.json()
                  const evt = matchData.event
                  
                  homeScore = evt.homeScore?.current ?? evt.homeScore?.display
                  awayScore = evt.awayScore?.current ?? evt.awayScore?.display
                  
                  if (homeScore !== undefined && awayScore !== undefined) {
                    return {
                      source: 'SofaScore (Free API)',
                      homeScore: parseInt(homeScore),
                      awayScore: parseInt(awayScore),
                      status: 'finished'
                    }
                  }
                }
              }
            }
          }
        }
      }
      
      // Delay between queries to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  } catch (error) {
    console.error('SofaScore error:', error.message)
  }
  return null
}

/**
 * Fetch from football-data.org
 */
async function fetchFromFootballData(match, apiKey) {
  try {
    // Search for the match by teams and date
    const date = new Date(match.kickoff).toISOString().split('T')[0]
    
    // Try to find the match in recent fixtures
    const response = await fetch(
      `https://api.football-data.org/v4/matches`,
      {
        headers: {
          'X-Auth-Token': apiKey
        }
      }
    )
    
    if (!response.ok) return null
    const data = await response.json()
    
    if (data.matches) {
      for (const m of data.matches) {
        const matchDate = m.utcDate.split('T')[0]
        if (matchDate !== date) continue
        
        const homeMatch = teamsMatch(match.home, m.homeTeam?.name || '')
        const awayMatch = teamsMatch(match.away, m.awayTeam?.name || '')
        
        if (homeMatch && awayMatch && m.status === 'FINISHED') {
          return {
            source: 'football-data.org',
            homeScore: m.score?.fullTime?.home,
            awayScore: m.score?.fullTime?.away,
            status: 'finished'
          }
        }
      }
    }
  } catch (error) {
    console.error('football-data.org error:', error.message)
  }
  return null
}

/**
 * Fetch from API-Football
 */
async function fetchFromAPIFootball(match, apiKey) {
  try {
    const date = new Date(match.kickoff).toISOString().split('T')[0]
    
    const response = await fetch(
      `https://v3.football.api-sports.io/fixtures?date=${date}`,
      {
        headers: {
          'x-apisports-key': apiKey
        }
      }
    )
    
    if (!response.ok) return null
    const data = await response.json()
    
    if (data.response) {
      for (const fixture of data.response) {
        const homeMatch = teamsMatch(match.home, fixture.teams?.home?.name || '')
        const awayMatch = teamsMatch(match.away, fixture.teams?.away?.name || '')
        
        if (homeMatch && awayMatch && fixture.fixture?.status?.short === 'FT') {
          return {
            source: 'API-Football',
            homeScore: fixture.goals?.home,
            awayScore: fixture.goals?.away,
            status: 'finished'
          }
        }
      }
    }
  } catch (error) {
    console.error('API-Football error:', error.message)
  }
  return null
}

/**
 * Main function: Try all APIs with fallback
 * SofaScore is PRIMARY (free and comprehensive) - always try it first
 */
export async function fetchMatchResult(match, apiKeys = {}) {
  const results = []
  
  // ALWAYS try SofaScore first - it's free and has ALL matches
  console.log(`   🔍 Fetching from FREE SofaScore API...`)
  const sofascoreResult = await fetchFromSofaScore(match)
  if (sofascoreResult) {
    console.log(`   ✅ ${sofascoreResult.source}: ${sofascoreResult.homeScore}-${sofascoreResult.awayScore}`)
    return sofascoreResult
  }
  
  // If SofaScore fails, try other APIs in parallel as fallback
  const promises = []
  
  if (apiKeys.footballData) {
    promises.push(fetchFromFootballData(match, apiKeys.footballData))
  }
  
  if (apiKeys.apiFootball) {
    promises.push(fetchFromAPIFootball(match, apiKeys.apiFootball))
  }
  
  if (promises.length > 0) {
    const apiResults = await Promise.allSettled(promises)
    
    for (const result of apiResults) {
      if (result.status === 'fulfilled' && result.value) {
        results.push(result.value)
      }
    }
  }
  
  // If we have multiple results, cross-validate
  if (results.length > 1) {
    const firstResult = results[0]
    const allMatch = results.every(r => 
      r.homeScore === firstResult.homeScore && 
      r.awayScore === firstResult.awayScore
    )
    
    if (allMatch) {
      console.log(`   ✅ Cross-validated from ${results.length} sources`)
      return firstResult
    } else {
      console.log(`   ⚠️  Conflict detected, using ${results[0].source}`)
      return firstResult
    }
  }
  
  // Return the first valid result, or null if none found
  return results[0] || null
}

export default fetchMatchResult
