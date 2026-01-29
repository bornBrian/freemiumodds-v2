/**
 * Mock data for development/testing when APIs are not configured
 * Replace with real API calls in production
 */

export function getMockMatches(date) {
  const today = new Date().toISOString().split('T')[0]
  
  // Only return data for today or future dates
  if (date < today) {
    return []
  }
  
  return [
    {
      id: 1,
      home: 'Manchester United',
      away: 'Liverpool',
      league: 'English Premier League',
      kickoff: `${date}T15:00:00Z`,
      status: 'pending',
      confidence: 87,
      tip: '1X',
      doubleChance: {
        '1X': 1.45,
        'X2': 1.32,
        '12': 1.18
      }
    },
    {
      id: 2,
      home: 'Real Madrid',
      away: 'Barcelona',
      league: 'Spanish La Liga',
      kickoff: `${date}T17:30:00Z`,
      status: 'pending',
      confidence: 91,
      tip: '12',
      doubleChance: {
        '1X': 1.28,
        'X2': 1.22,
        '12': 1.35
      }
    },
    {
      id: 3,
      home: 'Bayern Munich',
      away: 'Borussia Dortmund',
      league: 'German Bundesliga',
      kickoff: `${date}T19:00:00Z`,
      status: 'pending',
      confidence: 84,
      tip: 'X2',
      doubleChance: {
        '1X': 1.52,
        'X2': 1.48,
        '12': 1.25
      }
    },
    {
      id: 4,
      home: 'PSG',
      away: 'Marseille',
      league: 'French Ligue 1',
      kickoff: `${date}T20:00:00Z`,
      status: 'pending',
      confidence: 89,
      tip: '1X',
      doubleChance: {
        '1X': 1.35,
        'X2': 1.55,
        '12': 1.30
      }
    }
  ]
}

export function getMockOddslotTips() {
  return [
    {
      matchId: 'match_1',
      confidence: 87,
      tip: 'Home or Draw',
      source: 'oddslot'
    },
    {
      matchId: 'match_2',
      confidence: 91,
      tip: 'Home or Away',
      source: 'oddslot'
    },
    {
      matchId: 'match_3',
      confidence: 84,
      tip: 'Draw or Away',
      source: 'oddslot'
    }
  ]
}
