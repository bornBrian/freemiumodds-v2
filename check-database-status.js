import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

const {data, count} = await supabase
  .from('matches')
  .select('*', {count: 'exact'})

console.log('\n📊 Database Status:')
console.log('━'.repeat(60))
console.log(`Total matches: ${count}`)

if (data && data.length > 0) {
  console.log('\n✅ Matches in database:')
  data.forEach((m, i) => {
    console.log(`\n${i+1}. ${m.home} vs ${m.away}`)
    console.log(`   League: ${m.league}`)
    console.log(`   Confidence: ${m.confidence}%`)
    console.log(`   Tip: ${m.tip}`)
    console.log(`   Bookmaker: ${m.bookmaker}`)
    
    const odds = m.doubleChance || m.double_chance
    if (odds) {
      console.log(`   Double Chance Odds:`)
      console.log(`     1X: ${odds['1X']}`)
      console.log(`     X2: ${odds['X2']}`)
      console.log(`     12: ${odds['12']}`)
    } else {
      console.log(`   ⚠️  No odds available`)
    }
  })
} else {
  console.log('\n⚠️  No matches in database')
}

console.log('\n' + '━'.repeat(60))
