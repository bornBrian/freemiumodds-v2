import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

console.log('🗑️  Clearing old matches from database...')

// Delete ALL matches - using gte with id 1
const { data: allMatches } = await supabase
  .from('matches')
  .select('id')

console.log(`Found ${allMatches?.length || 0} matches in database`)

// Delete all
const { error } = await supabase
  .from('matches')
  .delete()
  .in('id', allMatches?.map(m => m.id) || [])

if (error) {
  console.error('❌ Error:', error.message)
} else {
  console.log('✅ Database cleared successfully!')
  console.log('💡 Restart the server to fetch fresh Oddslot predictions')
}
