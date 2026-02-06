import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

console.log('🔧 Fixing incorrect match results...\n')

// Fix Maccabi Jaffa vs Maccabi Tel Aviv - 0-5 (X2 tip) = WON
const { data: match1 } = await supabase
  .from('matches')
  .select('*')
  .ilike('home', '%Maccabi Jaffa%')
  .ilike('away', '%Maccabi Tel Aviv%')
  .single()

if (match1) {
  console.log('Found: Maccabi Jaffa vs Maccabi Tel Aviv')
  console.log(`  Current result: ${match1.result}`)
  console.log(`  Correct result: WON (0-5, X2 tip)`)
  
  await supabase
    .from('matches')
    .update({ result: 'won', final_score: '0-5' })
    .eq('id', match1.id)
  
  console.log('  ✅ Fixed!\n')
}

// Fix Mixto vs Sport Sinop - 0-0 (1X tip) = WON
const { data: match2 } = await supabase
  .from('matches')
  .select('*')
  .ilike('home', '%Mixto%')
  .ilike('away', '%Sport Sinop%')
  .single()

if (match2) {
  console.log('Found: Mixto vs Sport Sinop')
  console.log(`  Current result: ${match2.result}`)
  console.log(`  Correct result: WON (0-0, 1X tip)`)
  
  await supabase
    .from('matches')
    .update({ result: 'won', final_score: '0-0' })
    .eq('id', match2.id)
  
  console.log('  ✅ Fixed!\n')
}

// Sporting CP vs AFS is actually LOST (1-5, 1X tip) - leave as is
const { data: match3 } = await supabase
  .from('matches')
  .select('*')
  .ilike('home', '%Sporting%')
  .ilike('away', '%AFS%')
  .single()

if (match3) {
  console.log('Found: Sporting CP vs AFS')
  console.log(`  Current result: ${match3.result}`)
  console.log(`  Correct result: LOST (1-5, 1X tip) - Already correct`)
  
  await supabase
    .from('matches')
    .update({ final_score: '1-5' })
    .eq('id', match3.id)
  
  console.log('  ✅ Score updated\n')
}

console.log('✅ All corrections applied!')
