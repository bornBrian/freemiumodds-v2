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
  if (search.includes(result) || result.includes(search)) return true
  
  const searchWords = search.split(' ').filter(w => w.length > 2)
  const resultWords = result.split(' ').filter(w => w.length > 2)
  
  if (searchWords.length === 1 || resultWords.length === 1) {
    for (const sw of searchWords) {
      for (const rw of resultWords) {
        if (sw.includes(rw) || rw.includes(sw)) return true
      }
    }
    return false
  }
  
  let matches = 0
  for (const sw of searchWords) {
    for (const rw of resultWords) {
      if (sw.includes(rw) || rw.includes(sw)) matches++
    }
  }
  return matches >= Math.min(2, searchWords.length)
}

/**
 * Fetch from RapidAPI SofaScore
 */
async function fetchFromSofaScore(match, rapidApiKey) {
  try {
    const queries = [
      `${match.home} ${match.away}`,
      normalizeTeam(match.home),
      normalizeTeam(match.away)
    ]
    
    const matchTimestamp = new Date(match.kickoff).getTime()
    const oneDayMs = 86400000
    
    for (const query of queries) {
      const response = await fetch(
        `https://sofascore.p.rapidapi.com/search?q=${encodeURIComponent(query)}`,
        {
          headers: {
            'x-rapidapi-host': 'sofascore.p.rapidapi.com',
            'x-rapidapi-key': rapidApiKey
          }
        }
      )
      
      if (!response.ok) continue
      const data = await response.json()
      
      if (data.results) {
        for (const result of data.results) {
          if (result.type === 'event' && result.entity) {
            const event = result.entity
            const eventTimestamp = event.startTimestamp * 1000
            const timeDiff = Math.abs(eventTimestamp - matchTimestamp)
            
            if (timeDiff <= oneDayMs) {
              const homeMatch = teamsMatch(match.home, event.homeTeam?.name || '')
              const awayMatch = teamsMatch(match.away, event.awayTeam?.name || '')
              
              if (homeMatch && awayMatch && event.status?.type === 'finished') {
                // Get detailed match info
                const detailResponse = await fetch(
                  `https://sofascore.p.rapidapi.com/matches/get-detail?eventId=${event.id}`,
                  {
                    headers: {
                      'x-rapidapi-host': 'sofascore.p.rapidapi.com',
                      'x-rapidapi-key': rapidApiKey
                    }
                  }
                )
                
                if (detailResponse.ok) {
                  const matchData = await detailResponse.json()
                  const evt = matchData.event
                  
                  if (evt.homeScore && evt.awayScore) {
                    return {
                      source: 'SofaScore',
                      homeScore: evt.homeScore.current || evt.homeScore.display,
                      awayScore: evt.awayScore.current || evt.awayScore.display,
                      status: 'finished'
                    }
                  }
                }
              }
            }
          }
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 300))
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
 */
export async function fetchMatchResult(match, apiKeys) {
  const results = []
  
  // Try all APIs in parallel for speed
  const promises = []
  
  if (apiKeys.rapidapi) {
    promises.push(fetchFromSofaScore(match, apiKeys.rapidapi))
  }
  
  if (apiKeys.footballData) {
    promises.push(fetchFromFootballData(match, apiKeys.footballData))
  }
  
  if (apiKeys.apiFootball) {
    promises.push(fetchFromAPIFootball(match, apiKeys.apiFootball))
  }
  
  const apiResults = await Promise.allSettled(promises)
  
  for (const result of apiResults) {
    if (result.status === 'fulfilled' && result.value) {
      results.push(result.value)
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
  
  // Return the first valid result
  return results[0] || null
}

export default fetchMatchResult
