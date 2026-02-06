import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

console.log('🔧 Fixing Sporting CP vs AFS to WON (3-2)...\n')

// Fix Sporting CP vs AFS - User confirmed it's 3-2 (WON with 1X tip)
const { data: matches } = await supabase
  .from('matches')
  .select('*')
  .or('home.ilike.%Sporting%,away.ilike.%Sporting%')
  .or('home.ilike.%AFS%,away.ilike.%AFS%')

console.log(`Found ${matches?.length || 0} Sporting/AFS matches:\n`)

for (const match of matches || []) {
  if ((match.home.includes('Sporting') && match.away.includes('AFS')) ||
      (match.away.includes('Sporting') && match.home.includes('AFS'))) {
    console.log(`Match: ${match.home} vs ${match.away}`)
    console.log(`  Current: ${match.result} - ${match.final_score}`)
    console.log(`  Tip: ${match.tip}`)
    console.log(`  Fixing to: WON (3-2)\n`)
    
    await supabase
      .from('matches')
      .update({ 
        result: 'won', 
        final_score: '3-2',
        updated_at: new Date().toISOString()
      })
      .eq('id', match.id)
    
    console.log('  ✅ Fixed!')
  }
}

console.log('\n✅ Sporting CP result corrected!')
