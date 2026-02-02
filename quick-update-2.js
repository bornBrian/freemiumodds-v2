import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

console.log('Updating 2 specific matches...\n')

// Update Boreham Wood vs Boston Utd (1-2, lost)
const result1 = await supabase
  .from('matches')
  .update({
    status: 'completed',
    result: 'lost',
    final_score: '1-2',
    updated_at: new Date().toISOString()
  })
  .eq('home', 'Boreham Wood')
  .eq('away', 'Boston Utd')
  .eq('status', 'pending')
  .select()

console.log('1. Boreham Wood vs Boston Utd: 1-2')
console.log(result1.data?.length > 0 ? '   ✅ Updated' : '   ❌ Not found')

// Update Westerlo W vs Club Brugge W (3-3, won)
const result2 = await supabase
  .from('matches')
  .update({
    status: 'completed',
    result: 'won',
    final_score: '3-3',
    updated_at: new Date().toISOString()
  })
  .eq('home', 'Westerlo W')
  .eq('away', 'Club Brugge W')
  .eq('status', 'pending')
  .select()

console.log('2. Westerlo W vs Club Brugge W: 3-3')
console.log(result2.data?.length > 0 ? '   ✅ Updated' : '   ❌ Not found')

console.log('\n✅ Done')
