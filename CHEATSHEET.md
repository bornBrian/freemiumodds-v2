# 🚀 QUICK START CHEATSHEET

**FreemiumOdds V2 - Essential Commands & Links**

---

## ⚡ Installation (First Time)

```bash
# Windows (double-click)
start.bat

# OR manually:
npm run install:all
node setup.js
```

---

## 🏃 Development

```bash
# Start everything (frontend + backend)
npm run dev

# Frontend only (http://localhost:3000)
cd client && npm run dev

# Backend only (http://localhost:3001)
npm run dev:server
```

---

## 🔨 Build & Deploy

```bash
# Build frontend
cd client && npm run build

# Test production build locally
cd client && npm run preview

# Deploy to Vercel (auto-deploy from Git)
git push origin main
```

---

## 📊 Database

```bash
# Run schema (in Supabase SQL Editor)
Copy: database/schema.sql → paste → run

# View data
https://supabase.com/dashboard → Table Editor → matches
```

---

## 🔄 Manual Match Fetch

```bash
# Trigger fetch manually
curl -X POST http://localhost:3001/api/scheduler/fetch-daily

# Or in production
curl -X POST https://your-app.vercel.app/api/scheduler/fetch-daily
```

---

## 📡 API Endpoints

```bash
# Health check
GET /api/health

# Get today's matches
GET /api/matches

# Get matches for specific date
GET /api/matches?date=2026-01-30

# Get single match
GET /api/matches/:id

# Trigger daily fetch (manual)
POST /api/scheduler/fetch-daily

# Update match statuses
POST /api/scheduler/update-statuses
```

---

## 🌐 Important URLs

**Local:**
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- API Docs: http://localhost:3001/api/health

**Production:**
- Your App: https://your-app.vercel.app
- Vercel Dashboard: https://vercel.com/dashboard
- Supabase Dashboard: https://supabase.com/dashboard
- TheOddsAPI: https://the-odds-api.com/account

---

## 🔑 Environment Variables

Create `.env` file:

```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJhbGc...
ODDS_API_KEY=your_key
PORT=3001
NODE_ENV=development
```

---

## 🐛 Troubleshooting

**Problem: "Mock data" showing**
```bash
# Check env vars are set
cat .env

# Verify Supabase connection
# Go to: https://supabase.com/dashboard → Your Project → Settings → API
```

**Problem: Dependencies not installed**
```bash
rm -rf node_modules client/node_modules
npm run install:all
```

**Problem: Port already in use**
```bash
# Kill process on port 3000
npx kill-port 3000

# Or change port in .env
PORT=3002
```

**Problem: Build fails**
```bash
# Clear cache
rm -rf .next dist client/dist
npm run build
```

---

## 📦 Project Structure

```
freemium/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── App.jsx      # Main app
│   │   └── main.jsx     # Entry point
│   └── package.json
├── api/                 # Express backend
│   ├── routes/          # API endpoints
│   ├── services/        # Business logic
│   ├── utils/           # Helpers
│   └── index.js         # Server entry
├── database/
│   └── schema.sql       # Database schema
├── .env                 # Environment variables
├── vercel.json          # Vercel config
└── package.json         # Root dependencies
```

---

## 🎨 Key Files to Edit

**UI Changes:**
- `client/src/components/MatchCard.jsx` - Match card design
- `client/src/components/Header.jsx` - Top navigation
- `client/tailwind.config.js` - Color theme

**API Logic:**
- `api/routes/matches.js` - Match endpoints
- `api/utils/oddsConverter.js` - Odds calculation
- `api/services/oddsAPI.js` - External API calls

**Styling:**
- `client/src/index.css` - Global styles
- `client/tailwind.config.js` - Tailwind config

---

## 🧪 Testing

```bash
# Test odds converter
node -e "
  const {toDoubleChanceOdds} = require('./api/utils/oddsConverter.js');
  console.log(toDoubleChanceOdds({homeOdd: 2.1, drawOdd: 3.4, awayOdd: 3.6}));
"

# Test API endpoint
curl http://localhost:3001/api/matches

# Test with date
curl "http://localhost:3001/api/matches?date=2026-01-30"
```

---

## 📈 Monitoring

**Check API Usage:**
```bash
# TheOddsAPI remaining requests
# See: https://the-odds-api.com/account

# Vercel bandwidth
# See: https://vercel.com/dashboard/usage
```

**View Logs:**
```bash
# Vercel logs
vercel logs

# Or in dashboard:
https://vercel.com/dashboard → Your Project → Logs
```

---

## 🔄 Update & Redeploy

```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm run install:all

# Rebuild
npm run build

# Commit and push (auto-deploys on Vercel)
git add .
git commit -m "Update"
git push origin main
```

---

## 📞 Support

**Documentation:**
- README.md - Overview
- DEPLOYMENT.md - Full deployment guide
- COPILOT_GUIDE.md - Copilot tips
- TESTING.md - Testing guide

**Contact:**
- Email: bonbrian2@gmail.com
- Phone: +255 653 931 988

---

## 💡 Quick Tips

1. **Use mock data** for testing (no API keys needed)
2. **Check Vercel logs** if deployment fails
3. **Monitor API quotas** (TheOddsAPI: 500/month)
4. **Cache aggressively** to save API calls
5. **Test locally** before deploying

---

**Bookmark this page!** 📑
