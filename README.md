# FreemiumOdds V2 - Double Chance Predictions Platform

🚀 **Modern football predictions platform with automated double chance odds calculations**

Built with React, Express, Supabase - Optimized for **FREE hosting** (Vercel + Supabase).

---

## ✨ Features

- ⚡ **Double Chance Odds** - Automatically converted from 1X2 bookmaker odds
- 📊 **84%+ Confidence** - Filter high-confidence tips from Oddslot
- 📱 **Mobile-First Design** - Responsive React + Tailwind CSS
- 🔄 **Auto-Updates** - Scheduled match fetching and status updates
- 🆓 **Free Hosting Ready** - Vercel (frontend + backend) + Supabase (database)
- 🎯 **Real-Time Data** - Integration with TheOddsAPI

---

## 🏗️ Architecture

```
Frontend (React + Vite + Tailwind)
    ↓
Backend API (Express + Serverless)
    ↓
┌─────────────────┬──────────────────┐
│   TheOddsAPI    │   Oddslot Tips   │
│  (1X2 Odds)     │  (Confidence)    │
└─────────────────┴──────────────────┘
    ↓
Odds Converter (Remove margin → Double Chance)
    ↓
Supabase PostgreSQL Database
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- Git

### 1️⃣ Clone & Install

```bash
cd d:\freemium
npm run install:all
```

### 2️⃣ Setup Environment Variables

Copy `.env.example` to `.env`:

```env
# Get free account at https://supabase.com
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key

# Get free 500 requests/month at https://the-odds-api.com
ODDS_API_KEY=your_odds_api_key

PORT=3001
NODE_ENV=development
```

### 3️⃣ Setup Database

1. Create free Supabase account: https://supabase.com
2. Create new project
3. Go to SQL Editor
4. Copy contents of `database/schema.sql` and run it
5. Copy your project URL and anon key to `.env`

### 4️⃣ Run Development Servers

```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- API Health: http://localhost:3001/api/health

---

## 📦 Free Hosting Deployment

### Option A: Vercel (Recommended - Easiest)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-repo-url
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to https://vercel.com
   - Import your GitHub repository
   - Vercel auto-detects config from `vercel.json`
   - Add environment variables in Vercel dashboard:
     - `SUPABASE_URL`
     - `SUPABASE_KEY`
     - `ODDS_API_KEY`

3. **Done!** Your site is live at `https://your-project.vercel.app`

### Option B: Separate Hosting

**Frontend (Vercel/Netlify):**
```bash
cd client
npm run build
# Deploy dist/ folder
```

**Backend (Railway/Render):**
- Railway: https://railway.app (free $5/month credit)
- Render: https://render.com (free tier available)

---

## 🤖 Automated Scheduling

### Vercel Cron (Free)

Create `vercel.json` cron configuration:

```json
{
  "crons": [{
    "path": "/api/scheduler/fetch-daily",
    "schedule": "0 2 * * *"
  }]
}
```

This runs daily at 2 AM UTC.

### Alternative: GitHub Actions (Free)

Create `.github/workflows/daily-fetch.yml`:

```yaml
name: Daily Match Fetch
on:
  schedule:
    - cron: '0 2 * * *'  # 2 AM UTC daily
  workflow_dispatch:

jobs:
  fetch:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger fetch
        run: |
          curl -X POST https://your-app.vercel.app/api/scheduler/fetch-daily
```

---

## 🔧 How It Works

### 1. Odds Conversion Math

```javascript
// Convert 1X2 → Double Chance
function toDoubleChanceOdds({homeOdd, drawOdd, awayOdd}) {
  // Remove bookmaker margin
  const pHome = 1 / homeOdd
  const pDraw = 1 / drawOdd
  const pAway = 1 / awayOdd
  const sum = pHome + pDraw + pAway
  
  // Fair probabilities
  const fHome = pHome / sum
  const fDraw = pDraw / sum
  const fAway = pAway / sum
  
  // Double chance
  return {
    '1X': 1 / (fHome + fDraw),  // Home or Draw
    'X2': 1 / (fDraw + fAway),  // Draw or Away
    '12': 1 / (fHome + fAway)   // Home or Away
  }
}
```

### 2. Daily Workflow

```
02:00 UTC: Cron triggers /api/scheduler/fetch-daily
    ↓
Fetch odds from TheOddsAPI
    ↓
Filter Oddslot tips (confidence ≥ 84%)
    ↓
Convert odds to double chance
    ↓
Save to Supabase
    ↓
Frontend auto-refreshes
```

---

## 📊 API Endpoints

### `GET /api/matches?date=YYYY-MM-DD`
Get matches for specific date

**Response:**
```json
{
  "date": "2026-01-29",
  "matches": [
    {
      "id": "uuid",
      "home": "Manchester United",
      "away": "Liverpool",
      "league": "English Premier League",
      "kickoff": "2026-01-29T15:00:00Z",
      "status": "pending",
      "confidence": 87,
      "tip": "1X",
      "doubleChance": {
        "1X": 1.45,
        "X2": 1.32,
        "12": 1.18
      }
    }
  ],
  "count": 1
}
```

### `POST /api/scheduler/fetch-daily`
Manually trigger daily fetch (protected endpoint in production)

### `GET /api/health`
Health check

---

## 💰 Cost Breakdown (FREE Tier)

| Service | Free Tier | What We Use |
|---------|-----------|-------------|
| **Vercel** | 100GB bandwidth/month | Frontend + API hosting |
| **Supabase** | 500MB database, 2GB bandwidth | PostgreSQL database |
| **TheOddsAPI** | 500 requests/month | Match odds (1-2 requests/day) |
| **GitHub Actions** | 2000 mins/month | Cron scheduling (optional) |

**Total: $0/month** for small-medium traffic

---

## 🎨 GitHub Copilot Tips

Use these prompts in VS Code:

```javascript
// Generate match card component with Tailwind CSS
// Component props: match object with home, away, odds, status

// Create function to fetch and parse odds from API
// Handle errors, validate data, return formatted object

// Write React hook to fetch matches on date change
// Include loading state, error handling, caching
```

**Best practices:**
- ✅ Write comments first, let Copilot generate code
- ✅ Review all suggestions for security
- ✅ Test edge cases manually
- ✅ Use Copilot for boilerplate, not business logic

---

## 🔐 Security Checklist

- [ ] Add rate limiting (use Vercel Edge Config)
- [ ] Validate all inputs
- [ ] Use environment variables for secrets
- [ ] Enable Supabase RLS policies
- [ ] Add CORS restrictions in production
- [ ] Rotate API keys regularly
- [ ] Monitor API usage quotas

---

## 📈 Monitoring (Free Options)

- **Vercel Analytics** - Built-in (free)
- **Supabase Dashboard** - Query performance, database stats
- **Sentry** - 5K errors/month free tier
- **UptimeRobot** - 50 monitors free

---

## 🐛 Troubleshooting

### "Mock data" showing instead of real matches
- Check SUPABASE_URL and SUPABASE_KEY are set
- Verify database schema is created
- Check Supabase logs for errors

### Odds API not returning data
- Verify ODDS_API_KEY is valid
- Check remaining requests: see API response headers
- Free tier: 500 req/month = ~16/day (use caching!)

### Build fails on Vercel
- Ensure `vercel.json` is properly configured
- Check build logs for missing dependencies
- Verify Node.js version (18+)

---

## 📚 Documentation Links

- [TheOddsAPI Docs](https://the-odds-api.com/liveapi/guides/v4/)
- [Supabase Docs](https://supabase.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [React + Vite](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## ⚖️ Legal & Compliance

- **Betting Disclaimer**: Always display "18+ only, gamble responsibly"
- **TOS Compliance**: Respect Oddslot terms, use official APIs where possible
- **Data Sources**: TheOddsAPI terms allow commercial use with attribution
- **Liability**: No guarantees on prediction accuracy

---

## 🤝 Contributing

1. Fork the repo
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📞 Support

- **Email**: bonbrian2@gmail.com
- **Phone**: +255 653 931 988
- **YouTube**: [@footbaplays](https://youtube.com/@footbaplays)

---

## 📝 License

MIT License - Free to use and modify

---

**Built with ❤️ using GitHub Copilot** 🚀
