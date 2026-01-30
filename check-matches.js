import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

console.log('📋 Checking matches in database...\n')

// Get all matches
const { data: allMatches, count } = await supabase
  .from('matches')
  .select('id, home, away, kickoff, status, created_at', { count: 'exact' })
  .order('kickoff', { ascending: true })
  .limit(10)

console.log(`Total matches: ${count}`)
console.log('\nNext 10 matches:')
console.log('─'.repeat(80))

allMatches.forEach((match, i) => {
  const kickoff = new Date(match.kickoff)
  const now = new Date()
  const hoursSince = (now - kickoff) / (1000 * 60 * 60)
  
  console.log(`${i + 1}. ${match.home} vs ${match.away}`)
  console.log(`   Kickoff: ${kickoff.toLocaleString()}`)
  console.log(`   Status: ${match.status}`)
  console.log(`   Hours since kickoff: ${hoursSince.toFixed(1)}`)
  console.log(`   Should be completed: ${hoursSince > 2 ? 'YES ✅' : 'NO ⏳'}`)
  console.log('')
})

// Check if any matches should be completed
const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
const { data: shouldBeCompleted, count: shouldCount } = await supabase
  .from('matches')
  .select('*', { count: 'exact' })
  .eq('status', 'pending')
  .lt('kickoff', twoHoursAgo)

console.log('─'.repeat(80))
console.log(`\n⏰ Matches that should be completed (kickoff > 2 hours ago): ${shouldCount}`)

if (shouldBeCompleted && shouldBeCompleted.length > 0) {
  console.log('\n🏁 These matches need result updates:')
  shouldBeCompleted.slice(0, 5).forEach(m => {
    console.log(`   - ${m.home} vs ${m.away} (${new Date(m.kickoff).toLocaleString()})`)
  })
}
