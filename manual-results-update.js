/**
 * MANUAL RESULTS UPDATE
 * Run this to process all pending old matches
 */

import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { fetchMatchResult } from './api/services/multiApiResults.js'

dotenv.config()

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

async function manualResultsUpdate() {
  console.log('🔄 MANUAL RESULTS UPDATE - Processing all old pending matches\n')
  
  const apiKeys = {
    rapidapi: process.env.RAPIDAPI_KEY,
    footballData: process.env.FOOTBALL_DATA_ORG_KEY,
    apiFootball: process.env.API_FOOTBALL_KEY
  }
  
  // Get ALL matches that should be finished (2+ hours after kickoff)
  const twoHoursAgo = new Date(Date.now() - 120 * 60 * 1000).toISOString()
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  
  const { data: matches, error: fetchError } = await supabase
    .from('matches')
    .select('*')
    .eq('status', 'pending')
    .lt('kickoff', twoHoursAgo)
    .order('kickoff', { ascending: false })
  
  if (fetchError) {
    console.error('Error fetching matches:', fetchError)
    return
  }
  
  if (!matches || matches.length === 0) {
    console.log('✅ No pending matches need updating')
    return
  }
  
  console.log(`📊 Processing ${matches.length} matches\n`)
  
  let updated = 0
  let won = 0
  let lost = 0
  let noData = 0
  const sources = {}
  
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i]
    const progress = `[${i + 1}/${matches.length}]`
    
    try {
      console.log(`${progress} ${match.home} vs ${match.away}`)
      
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
        
        console.log(`   ${predictionResult === 'won' ? '✅' : '❌'} ${finalScore} (${result.source})`)
      } else if (match.kickoff < twentyFourHoursAgo) {
        // If no result after 24 hours, mark as no_data
        await supabase
          .from('matches')
          .update({
            status: 'no_data',
            result: 'no_data',
            final_score: null
          })
          .eq('id', match.id)
        
        noData++
        console.log(`   ⚠️  No data available (24h+ old)`)
      } else {
        console.log(`   ⏳ No result yet (< 24h old)`)
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000))
      
    } catch (err) {
      console.error(`   ❌ Error: ${err.message}`)
    }
  }
  
  console.log(`\n${'='.repeat(70)}`)
  console.log(`✅ COMPLETED`)
  console.log(`   Updated: ${updated} matches`)
  console.log(`   Won: ${won}`)
  console.log(`   Lost: ${lost}`)
  console.log(`   No Data: ${noData}`)
  console.log(`   Win Rate: ${updated > 0 ? Math.round((won / updated) * 100) : 0}%`)
  console.log(`\n📡 Sources:`, sources)
  console.log(`${'='.repeat(70)}`)
}

manualResultsUpdate()
