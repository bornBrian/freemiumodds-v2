import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

console.log('🔧 Fixing prediction results...\n')

// H. Akko 1-5 Maccabi Petah Tikva - Prediction X2 (draw or away win)
// Away won 5-1, so X2 = WON ✅
await supabase
  .from('matches')
  .update({ result: 'won' })
  .ilike('home', '%H. Akko%')

console.log('✅ H. Akko vs Maccabi Petah Tikva: 1-5 - X2 prediction = WON')

// Stoke City U21 1-6 Manchester City U21 - Prediction X2 (draw or away win)
// Away won 6-1, so X2 = WON ✅
await supabase
  .from('matches')
  .update({ result: 'won' })
  .ilike('home', '%Stoke City%')

console.log('✅ Stoke City U21 vs Manchester City U21: 1-6 - X2 prediction = WON')

console.log('\n✅ Both X2 predictions are now correctly marked as WON!')
