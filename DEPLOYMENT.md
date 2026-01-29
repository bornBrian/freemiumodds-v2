# 🚀 DEPLOYMENT GUIDE - FreemiumOdds V2

Complete step-by-step guide for deploying to **100% FREE hosting**.

---

## 📋 Prerequisites Checklist

- [ ] GitHub account
- [ ] Vercel account (free): https://vercel.com
- [ ] Supabase account (free): https://supabase.com
- [ ] TheOddsAPI key (free 500/mo): https://the-odds-api.com

---

## STEP 1: Setup Supabase Database (5 minutes)

### 1.1 Create Project
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Choose organization (create if first time)
4. Project name: `freemiumodds`
5. Database password: **Save this!** (generate strong password)
6. Region: Choose closest to your users
7. Click "Create new project" (takes ~2 minutes)

### 1.2 Run Database Schema
1. Go to SQL Editor (left sidebar)
2. Click "New query"
3. Copy entire contents of `database/schema.sql`
4. Paste and click "Run"
5. You should see: "✅ FreemiumOdds V2 database schema created successfully!"

### 1.3 Get API Credentials
1. Go to Project Settings → API
2. Copy:
   - **Project URL**: `https://xxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (long string)
3. Save these for later!

---

## STEP 2: Get TheOddsAPI Key (2 minutes)

### 2.1 Sign Up
1. Go to https://the-odds-api.com
2. Click "Get API Key"
3. Enter email
4. Verify email
5. Dashboard shows your API key

### 2.2 Test Key (Optional)
```bash
curl "https://api.the-odds-api.com/v4/sports/?apiKey=YOUR_KEY"
```

You get **500 free requests/month** (enough for daily updates).

---

## STEP 3: Deploy to Vercel (10 minutes)

### 3.1 Push to GitHub
```bash
cd d:\freemium

# Initialize git
git init
git add .
git commit -m "Initial commit - FreemiumOdds V2"

# Create repo on GitHub (via web)
# Then:
git remote add origin https://github.com/YOUR_USERNAME/freemiumodds.git
git branch -M main
git push -u origin main
```

### 3.2 Import to Vercel
1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your `freemiumodds` repo
4. Vercel auto-detects settings from `vercel.json` ✅
5. **BEFORE clicking Deploy**, add environment variables:

### 3.3 Add Environment Variables
In Vercel import screen, click "Environment Variables":

```
SUPABASE_URL = https://xxx.supabase.co
SUPABASE_KEY = eyJhbGc...your-anon-key...
ODDS_API_KEY = your-odds-api-key
NODE_ENV = production
```

### 3.4 Deploy!
1. Click "Deploy"
2. Wait 2-3 minutes
3. You'll get: `https://freemiumodds.vercel.app` (or similar)
4. Test: Open in browser!

---

## STEP 4: Setup Automated Scheduling (5 minutes)

### Option A: Vercel Cron (Recommended for Vercel hosting)

**Update `vercel.json`:**
```json
{
  "crons": [{
    "path": "/api/scheduler/fetch-daily",
    "schedule": "0 2 * * *"
  }]
}
```

Push changes:
```bash
git add vercel.json
git commit -m "Add cron schedule"
git push
```

Vercel automatically detects and enables cron!

### Option B: GitHub Actions (Works for any hosting)

Create `.github/workflows/daily-fetch.yml`:
```yaml
name: Daily Match Fetch
on:
  schedule:
    - cron: '0 2 * * *'  # 2 AM UTC
  workflow_dispatch:  # Manual trigger

jobs:
  fetch:
    runs-on: ubuntu-latest
    steps:
      - name: Fetch matches
        run: |
          curl -X POST https://YOUR_APP.vercel.app/api/scheduler/fetch-daily
```

Commit and push to enable!

### Option C: External Cron (cron-job.org)

1. Go to https://cron-job.org (free account)
2. Create job:
   - **URL**: `https://your-app.vercel.app/api/scheduler/fetch-daily`
   - **Schedule**: Every day at 02:00
   - **Method**: POST
3. Enable job

---

## STEP 5: Verify Deployment ✅

### 5.1 Manual Tests

```bash
# Test homepage
curl https://your-app.vercel.app/

# Test API health
curl https://your-app.vercel.app/api/health

# Test matches endpoint
curl https://your-app.vercel.app/api/matches

# Manually trigger fetch (first time)
curl -X POST https://your-app.vercel.app/api/scheduler/fetch-daily
```

### 5.2 Browser Tests

1. **Open homepage**: Should show UI
2. **Check date picker**: Change dates
3. **View matches**: Should show mock data or real matches
4. **Mobile view**: Test responsive design

### 5.3 Database Check

Go to Supabase dashboard → Table Editor → `matches`:
- After running fetch, you should see matches!

---

## STEP 6: Monitoring & Maintenance

### 6.1 Check Quotas Weekly

**TheOddsAPI**:
- Dashboard: https://the-odds-api.com/account
- Monitor: Requests used / 500

**Vercel**:
- Dashboard: https://vercel.com/dashboard
- Monitor: Bandwidth, function executions

**Supabase**:
- Dashboard: https://supabase.com/dashboard
- Monitor: Database size (<500MB), bandwidth

### 6.2 Setup Alerts (Optional)

**Vercel Email Alerts:**
- Project Settings → Notifications
- Enable deployment and error alerts

**Supabase Alerts:**
- Project Settings → Email alerts
- Enable database size warnings

---

## 🔧 Common Issues & Solutions

### Issue: "Mock data" showing, no real matches

**Solution:**
1. Check Vercel env vars are set correctly
2. Re-deploy after adding env vars
3. Manually trigger fetch: `POST /api/scheduler/fetch-daily`
4. Check Vercel logs for errors

### Issue: "Database error"

**Solution:**
1. Verify Supabase URL/key are correct
2. Check SQL schema ran successfully
3. Test connection: Run query in Supabase SQL Editor
4. Check Row Level Security policies

### Issue: Cron not running

**Solution:**
1. Verify `vercel.json` cron config is correct
2. Check Vercel dashboard → Cron jobs tab
3. Or use external cron (cron-job.org)
4. Check logs after scheduled time

### Issue: API quota exceeded

**Solution:**
1. Cache responses (implement Redis or in-memory cache)
2. Reduce fetch frequency (every 2 days instead of daily)
3. Upgrade TheOddsAPI plan (paid tiers available)

---

## 📊 Performance Optimization

### 1. Enable Vercel Edge Caching
Add to API responses:
```javascript
res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate')
```

### 2. Optimize Images
- Use WebP format
- Add `loading="lazy"`
- Use Vercel Image Optimization

### 3. Database Indexing
Already included in schema! Indexes on:
- `kickoff` date
- `status`
- `provider_match_id`

---

## 🎯 Next Steps

**Week 1:**
- [ ] Deploy and test
- [ ] Add custom domain (Vercel: free)
- [ ] Setup monitoring

**Week 2:**
- [ ] Integrate Oddslot tips (if you have access)
- [ ] Add more sports/leagues
- [ ] Implement caching

**Month 1:**
- [ ] Analytics (Vercel Analytics - free)
- [ ] SEO optimization
- [ ] Social sharing cards

---

## 💡 Pro Tips

1. **Custom Domain**: Free on Vercel (add in project settings)
2. **HTTPS**: Automatic on Vercel ✅
3. **CDN**: Automatic on Vercel ✅
4. **Git Deploy**: Every push to main auto-deploys!
5. **Preview URLs**: Every branch gets preview URL
6. **Rollback**: One-click rollback in Vercel dashboard

---

## 📞 Need Help?

**Resources:**
- [Vercel Support](https://vercel.com/support)
- [Supabase Docs](https://supabase.com/docs)
- [TheOddsAPI Support](https://the-odds-api.com/contact)

**Project Support:**
- Email: bonbrian2@gmail.com
- Phone: +255 653 931 988

---

**You're now live! 🎉**

Share your URL and start getting traffic!
