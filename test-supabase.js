import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

console.log('Testing Supabase Connection...')
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ Not set')
console.log('SUPABASE_KEY:', process.env.SUPABASE_KEY ? '✅ Set' : '❌ Not set')
console.log('ODDS_API_KEY:', process.env.ODDS_API_KEY ? '✅ Set' : '❌ Not set')

if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)
  
  console.log('\nTesting database connection...')
  const { data, error, count } = await supabase
    .from('matches')
    .select('*', { count: 'exact' })
  
  if (error) {
    console.error('❌ Database error:', error.message)
  } else {
    console.log('✅ Connected successfully!')
    console.log(`📊 Total matches in database: ${count}`)
    console.log(`📋 Sample matches: ${data?.length || 0}`)
    
    // Check completed matches
    const { data: completed, count: completedCount } = await supabase
      .from('matches')
      .select('*', { count: 'exact' })
      .eq('status', 'completed')
    
    console.log(`✅ Completed matches: ${completedCount}`)
    
    if (completed && completed.length > 0) {
      const won = completed.filter(m => m.result === 'won').length
      console.log(`🏆 Won: ${won}`)
      console.log(`❌ Lost: ${completed.length - won}`)
      console.log(`📈 Win Rate: ${Math.round((won / completed.length) * 100)}%`)
    }
  }
} else {
  console.log('❌ Supabase credentials not configured')
}
