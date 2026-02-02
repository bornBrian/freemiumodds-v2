import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

async function checkPendingOld() {
  // Get matches that should be completed (2+ hours after kickoff)
  const twoHoursAgo = new Date(Date.now() - 120 * 60 * 1000).toISOString()
  
  const { data: matches, error } = await supabase
    .from('matches')
    .select('home, away, kickoff, status')
    .eq('status', 'pending')
    .lt('kickoff', twoHoursAgo)
    .order('kickoff', { ascending: false })
    .limit(30)
  
  if (error) {
    console.error('Error:', error)
    return
  }
  
  console.log(`\n📊 Found ${matches.length} PENDING matches that should be completed:\n`)
  console.log(`(Kickoff was more than 2 hours ago)\n`)
  
  matches.forEach(m => {
    const kickoffDate = new Date(m.kickoff)
    const hoursAgo = Math.floor((Date.now() - kickoffDate.getTime()) / (60 * 60 * 1000))
    console.log(`⏳ ${m.home} vs ${m.away}`)
    console.log(`   Kickoff: ${kickoffDate.toLocaleString()} (${hoursAgo} hours ago)`)
    console.log()
  })
}

checkPendingOld()
