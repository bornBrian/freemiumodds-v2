import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

console.log('🔧 Final fix - Setting all correct results\n')

// 1. Maccabi Jaffa 0-5 Maccabi Tel Aviv (X2) = WON
await supabase
  .from('matches')
  .update({ result: 'won', final_score: '0-5' })
  .ilike('home', '%Maccabi Jaffa%')
  .ilike('away', '%Maccabi Tel Aviv%')

console.log('✅ Maccabi Jaffa vs Maccabi Tel Aviv = WON (0-5)')

// 2. Sporting CP 3-2 AFS (1X) = WON
await supabase
  .from('matches')
  .update({ result: 'won', final_score: '3-2' })
  .ilike('home', '%Sporting%')
  .ilike('away', '%AFS%')

console.log('✅ Sporting CP vs AFS = WON (3-2)')

// 3. Mixto 0-0 Sport Sinop (1X) = WON  
await supabase
  .from('matches')
  .update({ result: 'won', final_score: '0-0' })
  .ilike('home', '%Mixto%')
  .ilike('away', '%Sport Sinop%')

console.log('✅ Mixto vs Sport Sinop = WON (0-0)')

console.log('\n✅ All 3 matches fixed!')
