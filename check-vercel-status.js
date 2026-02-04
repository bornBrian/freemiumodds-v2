/**
 * CHECK VERCEL CRON STATUS
 * Diagnose why auto-updates stopped
 */

import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

async function checkStatus() {
  console.log('🔍 CHECKING VERCEL AUTO-UPDATE STATUS\n')
  console.log(`📅 Current Time: ${new Date().toISOString()}`)
  console.log(`📅 Local Time: ${new Date().toString()}\n`)
  
  // Check environment variables
  console.log('🔐 Environment Variables:')
  console.log(`   RAPIDAPI_KEY: ${process.env.RAPIDAPI_KEY ? '✅ Set' : '❌ Missing'}`)
  console.log(`   API_FOOTBALL_KEY: ${process.env.API_FOOTBALL_KEY ? '✅ Set' : '❌ Missing'}`)
  console.log(`   FOOTBALL_DATA_ORG_KEY: ${process.env.FOOTBALL_DATA_ORG_KEY ? '✅ Set' : '❌ Missing'}`)
  console.log(`   SUPABASE_URL: ${process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing'}`)
  console.log(`   SUPABASE_KEY: ${process.env.SUPABASE_KEY ? '✅ Set' : '❌ Missing'}\n`)
  
  // Check recent match updates
  console.log('📊 Recent Database Activity:\n')
  
  try {
    // Check most recent match
    const { data: recentMatches } = await supabase
      .from('matches')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (recentMatches && recentMatches.length > 0) {
      console.log('   Last 5 Matches Added:')
      recentMatches.forEach((m, i) => {
        console.log(`   ${i + 1}. ${m.home} vs ${m.away}`)
        console.log(`      Created: ${m.created_at}`)
        console.log(`      Kickoff: ${m.kickoff}`)
        console.log(`      Status: ${m.status}`)
        console.log(`      Result: ${m.result || 'N/A'}`)
        console.log(`      Score: ${m.final_score || 'N/A'}\n`)
      })
    }
    
    // Check pending matches that should be updated
    const twoHoursAgo = new Date(Date.now() - 120 * 60 * 1000).toISOString()
    const { data: pendingMatches, count: pendingCount } = await supabase
      .from('matches')
      .select('*', { count: 'exact' })
      .eq('status', 'pending')
      .lt('kickoff', twoHoursAgo)
    
    console.log(`\n⏰ Pending Matches (2+ hours ago, need result update): ${pendingCount || 0}`)
    if (pendingMatches && pendingMatches.length > 0) {
      console.log('   ⚠️ These matches should have been auto-updated:')
      pendingMatches.slice(0, 10).forEach((m, i) => {
        const hoursAgo = Math.floor((Date.now() - new Date(m.kickoff).getTime()) / (60 * 60 * 1000))
        console.log(`   ${i + 1}. ${m.home} vs ${m.away}`)
        console.log(`      Kickoff: ${m.kickoff} (${hoursAgo}h ago)`)
        console.log(`      Tip: ${m.tip || m.best_pick || 'N/A'}\n`)
      })
    }
    
    // Check today's matches
    const today = new Date().toISOString().split('T')[0]
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
    const { data: todayMatches, count: todayCount } = await supabase
      .from('matches')
      .select('*', { count: 'exact' })
      .gte('kickoff', today)
      .lt('kickoff', tomorrow)
    
    console.log(`\n📅 Today's Matches in Database: ${todayCount || 0}`)
    if (todayMatches && todayMatches.length > 0) {
      todayMatches.forEach((m, i) => {
        console.log(`   ${i + 1}. ${m.home} vs ${m.away} - ${new Date(m.kickoff).toLocaleTimeString()}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Database Error:', error.message)
  }
  
  console.log('\n\n🔧 RECOMMENDED ACTIONS:')
  console.log('1. Check Vercel Cron Jobs: https://vercel.com/your-project/settings/cron-jobs')
  console.log('2. Check Vercel Logs: https://vercel.com/your-project/logs')
  console.log('3. Verify Environment Variables are set on Vercel')
  console.log('4. Manually trigger endpoints to test (use test-scheduler-endpoints.js)')
  console.log('5. Check if API rate limits exceeded (RapidAPI, API-Football)')
}

checkStatus()
