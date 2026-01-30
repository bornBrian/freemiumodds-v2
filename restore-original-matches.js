/**
 * Restore the original Oddslot matches from today
 */
import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

console.log('🔄 Restoring original matches from today...\n')

const today = '2026-01-30'

const matches = [
  {
    home: 'Al Qanah', away: 'Raya', league: 'Egypt: Division 2 A',
    kickoff: `${today}T12:30:00Z`, confidence: 87, tip: '1X',
    double_chance: { '1X': 1.03, 'X2': 1.03, '12': 1.01 },
    status: 'completed', result: 'won', final_score: '2-1'
  },
  {
    home: 'H. Akko', away: 'Maccabi Petah Tikva', league: 'Israel: Leumit League',
    kickoff: `${today}T13:00:00Z`, confidence: 81, tip: 'X2',
    double_chance: { '1X': 1.11, 'X2': 1.11, '12': 1.01 },
    status: 'completed', result: 'won', final_score: '1-1'
  },
  {
    home: 'Stoke City U21', away: 'Manchester City U21', league: 'England: Premier League 2',
    kickoff: `${today}T14:00:00Z`, confidence: 82, tip: 'X2',
    double_chance: { '1X': 1.10, 'X2': 1.10, '12': 1.01 },
    status: 'completed', result: 'won', final_score: '1-3'
  },
  {
    home: 'CFR Cluj', away: 'Metaloglobus Bucharest', league: 'Romania: Superliga',
    kickoff: `${today}T15:00:00Z`, confidence: 85, tip: '1X',
    double_chance: { '1X': 1.06, 'X2': 1.06, '12': 1.01 }
  },
  {
    home: 'Istanbulspor AS', away: 'Hatayspor', league: 'Turkey: 1. Lig',
    kickoff: `${today}T17:00:00Z`, confidence: 95, tip: '1X',
    double_chance: { '1X': 1.01, 'X2': 1.01, '12': 1.01 }
  },
  {
    home: 'Al Kholood', away: 'Al Nassr', league: 'Saudi Arabia: Saudi Professional League',
    kickoff: `${today}T17:30:00Z`, confidence: 89, tip: 'X2',
    double_chance: { '1X': 1.01, 'X2': 1.01, '12': 1.01 }
  },
  {
    home: 'Din. Bucuresti', away: 'Petrolul', league: 'Romania: Superliga',
    kickoff: `${today}T18:00:00Z`, confidence: 82, tip: '1X',
    double_chance: { '1X': 1.10, 'X2': 1.10, '12': 1.01 }
  },
  {
    home: 'Real Madrid B', away: 'Osasuna B', league: 'Spain: Primera Rfef - Group 1',
    kickoff: `${today}T18:00:00Z`, confidence: 82, tip: '1X',
    double_chance: { '1X': 1.10, 'X2': 1.10, '12': 1.01 }
  },
  {
    home: 'Dijon', away: 'Stade Briochin', league: 'France: National',
    kickoff: `${today}T18:30:00Z`, confidence: 84, tip: '1X',
    double_chance: { '1X': 1.07, 'X2': 1.07, '12': 1.01 }
  },
  {
    home: 'Arbroath', away: 'Airdrieonians', league: 'Scotland: Challenge Cup - Play Offs',
    kickoff: `${today}T19:45:00Z`, confidence: 84, tip: '1X',
    double_chance: { '1X': 1.07, 'X2': 1.07, '12': 1.01 }
  },
  {
    home: 'Lens', away: 'Le Havre', league: 'France: Ligue 1',
    kickoff: `${today}T19:45:00Z`, confidence: 85, tip: '1X',
    double_chance: { '1X': 1.06, 'X2': 1.06, '12': 1.01 }
  },
  {
    home: 'Gresford', away: 'Holywell', league: 'Wales: Cymru North',
    kickoff: `${today}T20:00:00Z`, confidence: 81, tip: 'X2',
    double_chance: { '1X': 1.11, 'X2': 1.11, '12': 1.01 }
  }
]

for (const match of matches) {
  const { error } = await supabase.from('matches').insert({
    provider_match_id: `oddslot-${match.home.toLowerCase().replace(/\s/g, '-')}-${Date.now()}`,
    home: match.home,
    away: match.away,
    league: match.league,
    kickoff: match.kickoff,
    status: match.status || 'pending',
    result: match.result || null,
    final_score: match.final_score || null,
    confidence: match.confidence,
    tip: match.tip,
    double_chance: match.double_chance,
    best_pick: match.tip,
    bookmaker: 'Oddslot'
  })
  
  if (error) {
    console.log(`❌ ${match.home} vs ${match.away}`)
  } else {
    const status = match.status === 'completed' ? `✅ ${match.final_score} - ${match.result}` : '⏳ Pending'
    console.log(`${status} | ${match.home} vs ${match.away}`)
  }
}

console.log('\n✅ Restored all original matches!')
