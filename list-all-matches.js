import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

console.log('📋 Listing all PENDING matches (not updated yet)...\n')

// Get all pending matches, ordered by date
const { data: matches, error } = await supabase
  .from('matches')
  .select('*')
  .eq('status', 'pending')
  .order('kickoff', { ascending: true })

if (error) {
  console.error('Error:', error)
  process.exit(1)
}

if (!matches || matches.length === 0) {
  console.log('✅ No pending matches - all updated!')
  process.exit(0)
}

console.log(`Found ${matches.length} pending matches:\n`)

// Group by date
const byDate = {}
for (const match of matches) {
  const date = new Date(match.kickoff).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
  if (!byDate[date]) byDate[date] = []
  byDate[date].push(match)
}

// Display grouped by date
for (const [date, dayMatches] of Object.entries(byDate)) {
  console.log(`\n📅 ${date} (${dayMatches.length} matches)`)
  console.log('='.repeat(70))
  
  for (const match of dayMatches) {
    const time = new Date(match.kickoff).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
    const hoursAgo = Math.round((Date.now() - new Date(match.kickoff).getTime()) / 1000 / 60 / 60)
    const status = hoursAgo > 0 ? `${hoursAgo}h ago` : `in ${-hoursAgo}h`
    
    console.log(`  ${time} | ${match.home} vs ${match.away}`)
    console.log(`         ${match.league} | ${match.tip} (${match.confidence}%) | ${status}`)
  }
}

console.log(`\n\n${'='.repeat(70)}`)
console.log(`Total: ${matches.length} matches still pending`)
console.log('='.repeat(70))

// Summary by how old they are
const now = Date.now()
const past = matches.filter(m => new Date(m.kickoff).getTime() < now - 3 * 60 * 60 * 1000)
const upcoming = matches.filter(m => new Date(m.kickoff).getTime() >= now - 3 * 60 * 60 * 1000)

console.log(`\n📊 Status:`)
console.log(`   Matches that SHOULD be updated (>3h old): ${past.length}`)
console.log(`   Upcoming/Recent matches (<3h): ${upcoming.length}`)

if (past.length > 0) {
  console.log(`\n⚠️  ${past.length} matches need results update!`)
}
