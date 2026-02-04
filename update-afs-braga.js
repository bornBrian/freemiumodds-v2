/**
 * MANUALLY UPDATE AFS VS BRAGA RESULT
 */

import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

async function updateMatch() {
  console.log('🔄 Updating AFS vs Braga with result 0-4...\n')
  
  // Find the match
  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .or('home.ilike.%AFS%,home.ilike.%AVS%')
    .or('away.ilike.%Braga%')
  
  if (!matches || matches.length === 0) {
    console.log('❌ Match not found')
    return
  }
  
  const match = matches[0]
  console.log(`Found: ${match.home} vs ${match.away}`)
  console.log(`Tip: ${match.tip || match.best_pick}`)
  
  // Result: 0-4 (Braga won)
  const finalScore = '0-4'
  const tip = match.tip || match.best_pick
  
  // Check if prediction was correct
  // X2 means draw or away win -> Braga won (4-0), so X2 would WIN
  let predictionResult = 'lost'
  if (tip === 'X2') predictionResult = 'won'  // Away win = X2 wins
  else if (tip === '12') predictionResult = 'won'  // No draw = 12 wins
  
  // Update database
  const { error } = await supabase
    .from('matches')
    .update({
      status: 'completed',
      result: predictionResult,
      final_score: finalScore
    })
    .eq('id', match.id)
  
  if (error) {
    console.error('❌ Error updating:', error.message)
  } else {
    console.log(`✅ ${match.home} vs ${match.away}: ${finalScore} - ${predictionResult.toUpperCase()}`)
  }
}

updateMatch()
