import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

console.log('Testing Supabase connection...\n')
console.log('URL:', process.env.SUPABASE_URL)
console.log('KEY:', process.env.SUPABASE_KEY ? 'Set (first 20 chars): ' + process.env.SUPABASE_KEY.substring(0, 20) + '...' : 'NOT SET')

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

// Test 1: Simple count
const { count, error: countError } = await supabase
  .from('matches')
  .select('*', { count: 'exact', head: true })

console.log('\n1. COUNT TEST:')
console.log('   Count:', count)
console.log('   Error:', countError)

// Test 2: Select all
const { data, error } = await supabase
  .from('matches')
  .select('*')

console.log('\n2. SELECT ALL TEST:')
console.log('   Data:', data?.length ? `${data.length} records` : 'No data')
console.log('   Error:', error)

// Test 3: Insert test record
const { data: insertData, error: insertError } = await supabase
  .from('matches')
  .insert({
    home: 'TEST HOME',
    away: 'TEST AWAY',
    league: 'Test League',
    kickoff: new Date().toISOString(),
    tip: '1X',
    odds: 1.50,
    confidence: 75,
    status: 'pending'
  })
  .select()

console.log('\n3. INSERT TEST:')
console.log('   Insert result:', insertData)
console.log('   Insert error:', insertError)

// Test 4: Count again
const { count: count2 } = await supabase
  .from('matches')
  .select('*', { count: 'exact', head: true })

console.log('\n4. COUNT AFTER INSERT:')
console.log('   Count:', count2)
