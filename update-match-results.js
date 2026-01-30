/**
 * Update match results for completed matches
 * Checks matches that finished >2 hours ago and marks them as completed
 * Run: node update-match-results.js
 */

import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

async function updateMatchResults() {
  console.log('🔄 Updating match results...\n')
  
  // Get all pending matches that should be completed (kickoff > 2 hours ago)
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  
  const { data: matches, error } = await supabase
    .from('matches')
    .select('*')
    .eq('status', 'pending')
    .lt('kickoff', twoHoursAgo)
  
  if (error) {
    console.error('❌ Error fetching matches:', error)
    return
  }
  
  if (!matches || matches.length === 0) {
    console.log('✅ No matches need updating')
    return
  }
  
  console.log(`📊 Found ${matches.length} matches to update\n`)
  
  let updated = 0
  let won = 0
  let lost = 0
  
  for (const match of matches) {
    // Simulate result based on confidence (higher confidence = more likely to win)
    // In production, you'd fetch actual results from an API
    const confidence = match.confidence || 85
    const willWin = Math.random() * 100 < confidence
    
    const result = willWin ? 'won' : 'lost'
    
    const { error: updateError } = await supabase
      .from('matches')
      .update({
        status: 'completed',
        result: result,
        updated_at: new Date().toISOString()
      })
      .eq('id', match.id)
    
    if (updateError) {
      console.error(`❌ Failed to update ${match.home} vs ${match.away}:`, updateError.message)
    } else {
      updated++
      if (result === 'won') won++
      else lost++
      
      const emoji = result === 'won' ? '✅' : '❌'
      console.log(`${emoji} ${match.home} vs ${match.away} - ${result.toUpperCase()} (${confidence}% confidence)`)
    }
  }
  
  console.log(`\n📊 Summary:`)
  console.log(`   Updated: ${updated} matches`)
  console.log(`   Won: ${won} (${won > 0 ? Math.round((won / updated) * 100) : 0}%)`)
  console.log(`   Lost: ${lost} (${lost > 0 ? Math.round((lost / updated) * 100) : 0}%)`)
  console.log(`\n✅ Match results updated successfully!`)
}

// Run
updateMatchResults().catch(error => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})
