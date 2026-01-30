/**
 * ODDSLOT SCRAPER SERVICE
 * Scrapes Oddslot.com for high-confidence predictions (84%+)
 */

import fetch from 'node-fetch'
import * as cheerio from 'cheerio'
import puppeteer from 'puppeteer'

/**
 * Scrape Oddslot for today's predictions with 81%+ confidence
 * Checks multiple pages to get ALL active predictions
 */
export async function scrapeOddslotPredictions() {
  try {
    console.log('🎯 Scraping Oddslot.com for predictions...')
    
    const allPredictions = []
    const maxPages = 20 // Check up to 20 pages
    let consecutiveEmptyPages = 0
    
    for (let page = 1; page <= maxPages; page++) {
      const url = `https://oddslot.com/tips/?page=${page}`
      console.log(`📄 Checking page ${page}...`)
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })
      
      if (!response.ok) {
        console.log(`⚠️  Page ${page} returned ${response.status} - stopping`)
        break
      }
      
      const html = await response.text()
      const $ = cheerio.load(html)
      
      // Check if table exists on this page
      const tableExists = $('table tbody tr').length > 0
      if (!tableExists) {
        console.log(`⚠️  No table found on page ${page} - stopping`)
        break
      }
      
      let pageMatches = 0
      let totalRowsOnPage = 0
      
      // Parse the table structure from Oddslot
      $('table tbody tr').each((i, element) => {
        try {
          const $row = $(element)
          const cells = $row.find('td')
          
          if (cells.length < 7) return
          
          totalRowsOnPage++
          
          const kickoffTime = $(cells[0]).text().trim()
          const homeTeam = $(cells[1]).text().trim()
          const awayTeam = $(cells[2]).text().trim()
          const league = $(cells[3]).text().trim()
          const chanceText = $(cells[4]).text().trim()
          const odds = $(cells[5]).text().trim()
          const prediction = $(cells[6]).text().trim()
          
          const confidence = parseFloat(chanceText.replace('%', '').trim())
          
          // Check if match is marked as finished (has score like 1:0 or 2:1)
          const resultText = $(cells[7])?.text().trim() || ''
          const hasScore = /\d+:\d+/.test(resultText)
          
          // Only include matches with 81%+ confidence and no final score
          if (homeTeam && awayTeam && !isNaN(confidence) && confidence >= 81 && !hasScore) {
            let normalizedPrediction = prediction
            if (prediction.toLowerCase().includes('home') || prediction === '1') {
              normalizedPrediction = '1'
            } else if (prediction.toLowerCase().includes('draw') || prediction === 'X') {
              normalizedPrediction = 'X'
            } else if (prediction.toLowerCase().includes('away') || prediction === '2') {
              normalizedPrediction = '2'
            }
            
            // Parse kickoff time for proper date
            let matchDate
            try {
              const now = new Date()
              const timeMatch = kickoffTime.match(/(\d{2}):(\d{2})/)
              
              if (timeMatch) {
                let hours = parseInt(timeMatch[1])
                const minutes = parseInt(timeMatch[2])
                
                // Add 3 hours to convert from Oddslot time to actual time
                hours = (hours + 3) % 24
                
                if (kickoffTime.toLowerCase().includes('today')) {
                  matchDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes)
                } else if (kickoffTime.toLowerCase().includes('tomorrow')) {
                  const tomorrow = new Date(now)
                  tomorrow.setDate(tomorrow.getDate() + 1)
                  matchDate = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), hours, minutes)
                } else if (kickoffTime.match(/\d{2}\/\d{2}/)) {
                  const datePart = kickoffTime.split(' ')[0]
                  const [month, day] = datePart.split('/')
                  matchDate = new Date(now.getFullYear(), parseInt(month) - 1, parseInt(day), hours, minutes)
                } else {
                  matchDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes)
                }
              } else {
                matchDate = new Date()
              }
            } catch (err) {
              matchDate = new Date()
            }
            
            allPredictions.push({
              home: homeTeam,
              away: awayTeam,
              prediction: normalizedPrediction,
              confidence,
              kickoff: matchDate ? matchDate.toISOString() : new Date().toISOString(),
              league: league || 'Unknown League',
              odds: odds || null,
              source: 'oddslot'
            })
            
            pageMatches++
            console.log(`  ✓ ${homeTeam} vs ${awayTeam} | ${normalizedPrediction} | ${confidence}% | ${league}`)
          }
        } catch (err) {
          console.error('Error parsing row:', err.message)
        }
      })
      
      console.log(`📊 Page ${page}: ${pageMatches} matches (81%+) out of ${totalRowsOnPage} total rows`)
      
      // Stop only if we get 3 consecutive pages with no rows at all
      if (totalRowsOnPage === 0) {
        consecutiveEmptyPages++
        if (consecutiveEmptyPages >= 3) {
          console.log(`⚠️  3 consecutive empty pages - stopping`)
          break
        }
      } else {
        consecutiveEmptyPages = 0
      }
    }
    
    console.log(`✅ Found ${allPredictions.length} total predictions with 81%+ confidence`)
    return allPredictions
    
  } catch (error) {
    console.error('❌ Error scraping Oddslot:', error.message)
    return []
  }
}

/**
 * Convert Oddslot prediction to Double Chance format
 * @param {string} prediction - '1' (home), 'X' (draw), '2' (away)
 * @returns {string} - '1X', 'X2', or '12'
 */
export function convertToDoubleChance(prediction) {
  const mapping = {
    '1': '1X',  // Home win → Home or Draw
    'X': '1X',  // Draw → Home or Draw (or could be 'X2')
    '2': 'X2',  // Away win → Draw or Away
    'Home': '1X',
    'Draw': '1X',
    'Away': 'X2'
  }
  
  return mapping[prediction] || '1X'
}

/**
 * Scrape Sportybet for real double chance odds
 */
/**
 * Scrape Sportybet for real double chance odds using Puppeteer
 * Optimized: Scrapes all matches at once with a single browser instance
 */
export async function scrapeSportybetOddsForMatches(matches) {
  let browser = null
  const results = []
  
  try {
    console.log(`🌐 Launching browser to scrape Sportybet for ${matches.length} matches...`)
    
    // Launch headless browser
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    })
    
    const page = await browser.newPage()
    
    // Set viewport and user agent
    await page.setViewport({ width: 1920, height: 1080 })
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    
    console.log(`📡 Loading Sportybet football today page...`)
    // Navigate to Sportybet football today page
    await page.goto('https://www.sportybet.com/ng/sport/football/today', {
      waitUntil: 'networkidle2',
      timeout: 30000
    })
    
    // Wait for matches to load
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    console.log(`🔍 Extracting odds for all matches from page...`)
    
    // Extract all matches and odds from the page
    const allMatchData = await page.evaluate(() => {
      const matchesFound = []
      
      // Helper function to normalize team names for matching
      const normalize = (name) => name.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
      
      // Look for match elements - try common selectors
      const matchElements = document.querySelectorAll('[class*="match"], [class*="event"], [class*="game"], [class*="fixture"]')
      
      matchElements.forEach(element => {
        try {
          const text = element.textContent || ''
          
          // Try to extract team names (usually format: "Team1 vs Team2" or "Team1 - Team2")
          const vsMatch = text.match(/([A-Za-z\s\.]+)(?:vs|v|-|–)([A-Za-z\s\.]+)/i)
          
          if (vsMatch) {
            const homeTeam = normalize(vsMatch[1])
            const awayTeam = normalize(vsMatch[2])
            
            // Look for odds within or near this element
            let container = element
            const odds = []
            
            // Search in current element and parent elements
            for (let i = 0; i < 3; i++) {
              const oddsElements = container.querySelectorAll('[class*="odd"], [class*="coef"], [class*="rate"], button, span')
              
              oddsElements.forEach(el => {
                const oddText = el.textContent.trim()
                const oddValue = parseFloat(oddText)
                if (!isNaN(oddValue) && oddValue >= 1.0 && oddValue <= 100) {
                  odds.push(oddValue)
                }
              })
              
              if (odds.length >= 3) break
              if (!container.parentElement) break
              container = container.parentElement
            }
            
            if (odds.length >= 3) {
              matchesFound.push({
                home: homeTeam,
                away: awayTeam,
                odds: {
                  '1X': odds[0],
                  'X2': odds[1],
                  '12': odds[2]
                }
              })
            }
          }
        } catch (err) {
          // Skip problematic elements
        }
      })
      
      return matchesFound
    })
    
    await browser.close()
    console.log(`✅ Found ${allMatchData.length} matches with odds on Sportybet`)
    
    // Match our predictions with Sportybet matches
    matches.forEach(match => {
      const homeNorm = match.home.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().substring(0, 10)
      const awayNorm = match.away.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().substring(0, 10)
      
      const found = allMatchData.find(sm => {
        return sm.home.includes(homeNorm.substring(0, 6)) && sm.away.includes(awayNorm.substring(0, 6))
      })
      
      if (found && found.odds) {
        console.log(`✅ Sportybet odds for ${match.home} vs ${match.away}: 1X=${found.odds['1X']}, X2=${found.odds['X2']}, 12=${found.odds['12']}`)
        results.push({
          home: match.home,
          away: match.away,
          odds: found.odds
        })
      } else {
        console.log(`⚠️  No Sportybet odds for ${match.home} vs ${match.away}`)
        results.push({
          home: match.home,
          away: match.away,
          odds: null
        })
      }
    })
    
    return results
    
  } catch (error) {
    console.error(`❌ Error scraping Sportybet:`, error.message)
    if (browser) {
      await browser.close().catch(() => {})
    }
    // Return null odds for all matches
    return matches.map(m => ({ home: m.home, away: m.away, odds: null }))
  }
}

/**
 * Legacy function for single match - calls batch function
 */
export async function scrapeSportybetOdds(homeTeam, awayTeam) {
  const results = await scrapeSportybetOddsForMatches([{ home: homeTeam, away: awayTeam }])
  return results[0]?.odds || null
}

/**
 * Search for match in Odds API by team names and get REAL double chance odds
 */
export async function findMatchOdds(homeTeam, awayTeam, apiKey) {
  try {
    console.log(`🔍 Searching for odds: ${homeTeam} vs ${awayTeam}`)
    
    // Comprehensive sports list covering major leagues worldwide
    const sports = [
      'soccer_epl', 'soccer_spain_la_liga', 'soccer_germany_bundesliga', 
      'soccer_italy_serie_a', 'soccer_france_ligue_one', 'soccer_uefa_champs_league',
      'soccer_uefa_europa_league', 'soccer_uefa_europa_conference_league',
      'soccer_netherlands_eredivisie', 'soccer_portugal_primeira_liga',
      'soccer_brazil_campeonato', 'soccer_argentina_primera_division', 'soccer_mexico_ligamx',
      'soccer_turkey_super_league', 'soccer_belgium_first_div', 'soccer_greece_super_league',
      'soccer_norway_eliteserien', 'soccer_denmark_superliga', 'soccer_sweden_allsvenskan',
      'soccer_switzerland_superleague', 'soccer_austria_bundesliga', 'soccer_poland_ekstraklasa',
      'soccer_scotland_premiership', 'soccer_usa_mls', 'soccer_japan_j_league',
      'soccer_korea_kleague1', 'soccer_china_superleague', 'soccer_australia_aleague',
      'soccer_england_league1', 'soccer_england_league2', 'soccer_spl',
      'soccer_england_championship', 'soccer_spain_segunda_division', 'soccer_germany_bundesliga2',
      'soccer_france_ligue_two', 'soccer_italy_serie_b'
    ]
    
    let checkedSports = 0
    let totalMatches = 0
    
    for (const sport of sports) {
      // Request h2h markets from multiple regions
      const url = `https://api.the-odds-api.com/v4/sports/${sport}/odds/?apiKey=${apiKey}&regions=eu,uk,us,au&markets=h2h&oddsFormat=decimal`
      const response = await fetch(url)
      checkedSports++
      
      if (!response.ok) {
        // Check if it's a quota error
        try {
          const errorData = await response.json()
          if (errorData.error_code === 'OUT_OF_USAGE_CREDITS') {
            console.log(`   ⚠️  Odds API quota exhausted - using approximated odds for remaining matches`)
            return null // Stop checking further sports
          }
        } catch (e) {
          // Ignore parsing errors, just continue
        }
        continue
      }
      
      const data = await response.json()
      totalMatches += data.length
      
      if (data.length > 0) {
        console.log(`   Checking ${sport}: ${data.length} matches available`)
      }
      
      // Very flexible matching - try multiple approaches
      const match = data.find(game => {
        const gameHome = game.home_team.toLowerCase()
        const gameAway = game.away_team.toLowerCase()
        const searchHome = homeTeam.toLowerCase()
        const searchAway = awayTeam.toLowerCase()
        
        // Try exact match
        if (gameHome.includes(searchHome) && gameAway.includes(searchAway)) return true
        if (searchHome.includes(gameHome) && searchAway.includes(gameAway)) return true
        
        // Try first 4 characters
        if (gameHome.substring(0, 4) === searchHome.substring(0, 4) && 
            gameAway.substring(0, 4) === searchAway.substring(0, 4)) return true
        
        // Try last word match (team names often end with key identifier)
        const homeLastWord = searchHome.split(' ').pop()
        const awayLastWord = searchAway.split(' ').pop()
        if (homeLastWord && awayLastWord && homeLastWord.length > 3 && awayLastWord.length > 3) {
          if (gameHome.includes(homeLastWord) && gameAway.includes(awayLastWord)) return true
        }
        
        return false
      })
      
      if (match && match.bookmakers && match.bookmakers.length > 0) {
        // Find bookmaker with best odds
        let bestBookmaker = null
        let bestOdds = null
        
        for (const bookmaker of match.bookmakers) {
          const h2hMarket = bookmaker.markets.find(m => m.key === 'h2h')
          
          if (h2hMarket && h2hMarket.outcomes.length >= 3) {
            const homeOdd = h2hMarket.outcomes.find(o => o.name === match.home_team)?.price
            const awayOdd = h2hMarket.outcomes.find(o => o.name === match.away_team)?.price
            const drawOdd = h2hMarket.outcomes.find(o => o.name === 'Draw')?.price
            
            if (homeOdd && drawOdd && awayOdd) {
              bestBookmaker = bookmaker.title
              bestOdds = {
                homeOdd: Number(homeOdd),
                drawOdd: Number(drawOdd),
                awayOdd: Number(awayOdd)
              }
              break // Use first available bookmaker
            }
          }
        }
        
        if (bestOdds) {
          return {
            matchId: match.id,
            homeOdd: bestOdds.homeOdd,
            drawOdd: bestOdds.drawOdd,
            awayOdd: bestOdds.awayOdd,
            bookmaker: bestBookmaker,
            kickoff: match.commence_time
          }
        }
      }
    }
    
    console.log(`   ❌ Not found - checked ${checkedSports} sports with ${totalMatches} total matches`)
    return null
  } catch (error) {
    console.error(`❌ Error finding odds for ${homeTeam} vs ${awayTeam}:`, error.message)
    return null
  }
}

export default {
  scrapeOddslotPredictions,
  convertToDoubleChance,
  findMatchOdds,
  scrapeSportybetOdds,
  scrapeSportybetOddsForMatches
}
