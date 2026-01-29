# Testing the Odds Converter

This guide helps you verify the double chance odds conversion is working correctly.

## Manual Test

```javascript
// In Node.js console or browser:
import { toDoubleChanceOdds } from './api/utils/oddsConverter.js'

// Example: Manchester United vs Liverpool
const odds = {
  homeOdd: 2.10,  // Man Utd win
  drawOdd: 3.40,  // Draw
  awayOdd: 3.60   // Liverpool win
}

const dc = toDoubleChanceOdds(odds)
console.log(dc)

// Expected output (approximately):
// {
//   '1X': 1.41,  // Man Utd or Draw
//   'X2': 1.76,  // Draw or Liverpool
//   '12': 1.32,  // Man Utd or Liverpool
//   _probs: { fHome: 0.447, fDraw: 0.276, fAway: 0.277 }
// }
```

## Validation Checks

1. **All odds should be ≥ 1.01**
2. **1X should be lowest** (combines home + draw probabilities)
3. **Probabilities should sum to ~1.00** (check `_probs`)
4. **Compare with real bookmaker** double chance odds (should be similar)

## Test Cases

```javascript
// Test 1: Heavy favorite
toDoubleChanceOdds({ homeOdd: 1.20, drawOdd: 6.00, awayOdd: 15.0 })
// 1X should be very low (~1.14)

// Test 2: Balanced match
toDoubleChanceOdds({ homeOdd: 2.50, drawOdd: 3.20, awayOdd: 2.80 })
// All three should be ~1.5-1.7

// Test 3: Extreme underdog
toDoubleChanceOdds({ homeOdd: 10.0, drawOdd: 5.0, awayOdd: 1.30 })
// X2 should be very low (~1.20)
```

## API Test

```bash
# Start server
npm run dev:server

# Trigger fetch (will process real odds if API key configured)
curl -X POST http://localhost:3001/api/scheduler/fetch-daily

# Check results
curl http://localhost:3001/api/matches?date=2026-01-29
```

## Expected Data Flow

```
TheOddsAPI returns:
{
  "home_team": "Manchester United",
  "away_team": "Liverpool",
  "bookmakers": [{
    "markets": [{
      "key": "h2h",
      "outcomes": [
        {"name": "Manchester United", "price": 2.10},
        {"name": "Draw", "price": 3.40},
        {"name": "Liverpool", "price": 3.60}
      ]
    }]
  }]
}

↓ Extract odds ↓

{ homeOdd: 2.10, drawOdd: 3.40, awayOdd: 3.60 }

↓ Convert ↓

{ "1X": 1.41, "X2": 1.76, "12": 1.32 }

↓ Save to DB ↓

Match saved with double_chance field
```

## Troubleshooting

**Issue**: Odds seem too high/low
- **Check**: Bookmaker margin (use `calculateMargin` function)
- **Typical margin**: 5-15% (sum of implied probs = 1.05-1.15)

**Issue**: Conversion fails
- **Check**: All three odds are valid numbers ≥ 1.01
- **Check**: No division by zero

**Issue**: Different from bookmaker DC odds
- **Expected**: Our odds remove margin, bookmaker adds margin
- **Our odds should be slightly better** (fair value)
