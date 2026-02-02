/**
 * Quick test of specific match
 */
import { createClient } from '@supabase/supabase-js'
import { fetchMatchResult } from './api/services/multiApiResults.js'
import 'dotenv/config'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

// Test with Hamburger SV vs Bayern Munich
const { data: match } = await supabase
  .from('matches')
  .select('*')
  .eq('home', 'Hamburger SV')
  .eq('away', 'Bayern Munich')
  .single()

if (!match) {
  console.log('Match not found')
  process.exit(1)
}

console.log(`Testing: ${match.home} vs ${match.away}`)
console.log(`Kickoff: ${match.kickoff}`)
console.log(`Status: ${match.status}\n`)

const result = await fetchMatchResult(match, {})

if (result) {
  console.log(`\n✅ FOUND: ${result.homeScore}-${result.awayScore}`)
  console.log(`Source: ${result.source}`)
} else {
  console.log('\n❌ No result found')
}
