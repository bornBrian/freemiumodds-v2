/**
 * Fetch REAL match results from FlashScore/LiveScore
 * Uses web scraping to get actual scores
 */
import { createClient } from '@supabase/supabase-js'
import puppeteer from 'puppeteer'
import 'dotenv/config'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

console.log('🔄 Fetching REAL results from FlashScore...\n')

// Get matches that need updating (>2 hours after kickoff)
const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
const { data: matches } = await supabase
  .from('matches')
  .select('*')
  .eq('status', 'pending')
  .lt('kickoff', twoHoursAgo)

if (!matches || matches.length === 0) {
  console.log('✅ No matches need updating')
  process.exit(0)
}

console.log(`📊 Found ${matches.length} matches to check\n`)

const browser = await puppeteer.launch({ headless: true })
const page = await browser.newPage()

let updated = 0
let won = 0
let lost = 0

for (const match of matches) {
  console.log(`\n🔍 ${match.home} vs ${match.away}`)
  
  try {
    // Search FlashScore for the match
    const searchUrl = `https://www.flashscore.com/search/?q=${encodeURIComponent(match.home + ' ' + match.away)}`
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 10000 })
    
    // Try to find the match and get the score
    await page.waitForSelector('.event__match', { timeout: 5000 }).catch(() => null)
    
    const result = await page.evaluate(() => {
      const matches = document.querySelectorAll('.event__match')
      if (matches.length > 0) {
        const firstMatch = matches[0]
        const homeScore = firstMatch.querySelector('.event__score--home')?.textContent
        const awayScore = firstMatch.querySelector('.event__score--away')?.textContent
        const status = firstMatch.querySelector('.event__stage')?.textContent
        
        if (homeScore && awayScore && status?.includes('Finished')) {
          return {
            homeScore: parseInt(homeScore),
            awayScore: parseInt(awayScore),
            found: true
          }
        }
      }
      return { found: false }
    })
    
    if (result.found) {
      // We got REAL data!
      const finalScore = `${result.homeScore}-${result.awayScore}`
      
      // Check if prediction won
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
          final_score: finalScore,
          updated_at: new Date().toISOString()
        })
        .eq('id', match.id)
      
      updated++
      if (predictionResult === 'won') won++
      else lost++
      
      const emoji = predictionResult === 'won' ? '✅' : '❌'
      console.log(`   ${emoji} REAL SCORE: ${finalScore} - ${predictionResult.toUpperCase()}`)
      
    } else {
      console.log(`   ⚠️  Not found on FlashScore - match might not have finished yet`)
    }
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`)
  }
  
  // Small delay between requests
  await new Promise(resolve => setTimeout(resolve, 1000))
}

await browser.close()

console.log(`\n\n📊 Summary:`)
console.log(`   Updated: ${updated} matches`)
console.log(`   Won: ${won}`)
console.log(`   Lost: ${lost}`)
console.log(`\n✅ All results fetched from REAL match data!`)
