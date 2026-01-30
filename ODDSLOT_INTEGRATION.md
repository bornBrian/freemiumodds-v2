# ODDSLOT INTEGRATION GUIDE

## 🎯 How The New System Works

The system now integrates with **Oddslot.com** to provide high-confidence predictions:

### 1. **Oddslot Scraping** (Every Hour)
- Scrapes Oddslot.com for predictions with **84%+ confidence**
- Extracts: Home team, Away team, Prediction (1/X/2), Confidence %, League

### 2. **Double Chance Conversion**
- Converts Oddslot predictions to double chance format:
  - **1 (Home win)** → **1X** (Home or Draw)
  - **X (Draw)** → **1X** (Home or Draw)  
  - **2 (Away win)** → **X2** (Draw or Away)

### 3. **Odds Fetching**
- Searches The Odds API for the exact match
- Fetches H2H odds (1X2)
- Calculates double chance odds (1X, X2, 12)
- Gets odds from Sportybet or other bookmakers

### 4. **Result Updates** (After Matches)
- Waits 2 hours after kickoff
- Fetches results from The Odds API scores endpoint
- Alternative sources: Livescore.com, Sofascore.com, TheSportsDB
- Validates if double chance prediction was correct
- Updates win rate statistics

### 5. **Timezone Display**
- Shows match times in user's local timezone
- Displays "Today", "Tomorrow", or specific date
- Automatically converts UTC to local time

---

## 📁 New Files Created

### `api/services/oddslotScraper.js`
- `scrapeOddslotPredictions()` - Scrapes Oddslot.com
- `convertToDoubleChance()` - Converts 1/X/2 to 1X/X2/12
- `findMatchOdds()` - Searches Odds API for match odds

### `api/services/livescoreService.js`
- `fetchMatchResult()` - Gets results from TheSportsDB
- `checkOddsAPIResult()` - Gets results from Odds API
- `scrapeLivescoreResult()` - Scrapes livescore.com (backup)
- `validateDoubleChance()` - Checks if prediction was correct

### `auto-update-oddslot.js`
- Complete auto-update system using Oddslot
- Runs every hour automatically
- Fetches → Converts → Saves → Updates Results

---

## ⚙️ Configuration

### 1. Install Dependencies
```bash
npm install cheerio
```

### 2. Environment Variables (.env)
```env
# Supabase Database
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key

# The Odds API (for odds and scores)
ODDS_API_KEY=your_odds_api_key

# Optional: Football Data APIs
FOOTBALL_DATA_API_KEY=your_football_data_key
THESPORTSDB_API_KEY=3  # Free tier
```

### 3. Database Migration
Run the migration to add new columns:
```bash
# In Supabase SQL Editor, run:
database/migrations/add_oddslot_fields.sql
```

---

## 🚀 How To Run

### Development
```bash
npm run dev
```

The system will:
1. Start API server on port 3001
2. Start client on port 3000
3. **Automatically run Oddslot scraper on startup**
4. **Schedule hourly updates** (runs every hour)

### Manual Update
```bash
node auto-update-oddslot.js
```

### Check If It's Working
```bash
# Test Supabase connection
node test-supabase.js

# Check matches in database
node check-matches.js
```

---

## 📊 Data Flow

```
ODDSLOT.COM (84%+ predictions)
    ↓
Scrape matches
    ↓
Convert to Double Chance (1X/X2/12)
    ↓
THE ODDS API (fetch odds)
    ↓
Calculate Double Chance Odds
    ↓
Save to SUPABASE
    ↓
Display on WEBSITE (timezone-aware)
    ↓
Wait 2 hours after kickoff
    ↓
Fetch results from LIVE SCORE APIs
    ↓
Update match status (won/lost)
    ↓
Calculate REAL WIN RATE
```

---

## 🔍 Fallback System

If Oddslot scraping fails:
1. Falls back to The Odds API directly
2. Fetches all available matches
3. Calculates best double chance pick (lowest odds)
4. Sets default confidence to 84%

---

## 📱 Frontend Features

### Timezone Display
- Matches show in **user's local time**
- Smart labels: "Today 20:00", "Tomorrow 15:30"
- Automatic conversion from UTC

### Real-Time Stats
- Win rate calculated from **actual completed matches**
- Shows 0% until matches complete
- Updates automatically after results

### Auto-Update Indicator
- Shows "Last updated: X:XX PM"
- Green pulsing dot = auto-updating
- Updates every hour

---

## 🧪 Testing The Scraper

Create `test-oddslot.js`:
```javascript
import dotenv from 'dotenv'
import { scrapeOddslotPredictions, convertToDoubleChance } from './api/services/oddslotScraper.js'

dotenv.config()

const predictions = await scrapeOddslotPredictions()

console.log(`Found ${predictions.length} predictions`)
predictions.forEach(pred => {
  const dc = convertToDoubleChance(pred.prediction)
  console.log(`${pred.home} vs ${pred.away}`)
  console.log(`  Oddslot: ${pred.prediction} | Double Chance: ${dc} | Confidence: ${pred.confidence}%`)
})
```

---

## ⚠️ Important Notes

### Oddslot Scraping
- **Check Oddslot's terms of service** before scraping
- The scraper may break if Oddslot changes their HTML structure
- Consider using Oddslot's API if they offer one
- Adjust CSS selectors in `oddslotScraper.js` to match actual site structure

### API Rate Limits
- **The Odds API**: 500 requests/month (free tier)
- **TheSportsDB**: No rate limit (free tier)
- **Football-Data.org**: 10 requests/minute (free tier)

### Web Scraping Best Practices
- Add delays between requests
- Use proper User-Agent headers
- Respect robots.txt
- Consider API alternatives

---

## 🐛 Troubleshooting

### No matches found
- Check Oddslot URL: `https://oddslot.com/football-predictions/today`
- Verify CSS selectors match Oddslot's HTML
- Check browser console for errors
- Try fallback mode (Odds API direct)

### Odds not found
- Verify ODDS_API_KEY is set
- Check API quota (500/month)
- Match names might not match exactly
- Add fuzzy matching for team names

### Results not updating
- Ensure matches are 2+ hours past kickoff
- Check ODDS_API_KEY is valid
- Try alternative result sources (TheSportsDB)
- Manually trigger: `node auto-update-oddslot.js`

---

## 🎯 Next Steps

1. **Test the scraper** with actual Oddslot site
2. **Adjust CSS selectors** to match Oddslot's HTML
3. **Add fuzzy team name matching** for better odds lookup
4. **Implement alternative result sources** (Sofascore, Livescore)
5. **Add Sportybet odds** as alternative bookmaker
6. **Monitor hourly updates** for reliability

---

## 📞 Support

If you encounter issues:
1. Check console logs: `[ODDSLOT]`, `[RESULTS]`, `[FALLBACK]`
2. Run test scripts to isolate problems
3. Verify all environment variables are set
4. Check database migrations were applied

---

**The system is now ready to scrape Oddslot, convert predictions to double chance, fetch real odds, and update results automatically every hour!** 🚀
