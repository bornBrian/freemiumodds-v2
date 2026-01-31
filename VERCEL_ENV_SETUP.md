# 🔧 Vercel Environment Variables Setup

## Your Environment Variables

Add these in your Vercel Dashboard:

1. Go to: https://vercel.com/boltanxs-projects/freemiumodds-v2/settings/environment-variables

2. Add these variables:

### SUPABASE_URL
```
https://jtxpmlajhrkasfphuucm.supabase.co
```

### SUPABASE_KEY
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0eHBtbGFqaHJrYXNmcGh1dWNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MTc5MzgsImV4cCI6MjA4NTI5MzkzOH0.dMvfwmwk4JC1Z_qxIxr45cDdZOHl2xO8FaQlZVklO_M
```

### ODDS_API_KEY
```
02c41f98958505825c85a23754e881b4
```

### API_FOOTBALL_KEY (NEW - for real match results)
```
6f965235007cf99bbfdebd076f78683d
```

### RAPIDAPI_KEY (SofaScore via RapidAPI)
```
fec633af79mshf7000f109cc0255p1b5e39jsn10b0eb338982
```

### SPORTSAPI360_KEY (Multi-sport data)
```
7e6cf29ae14e1048fcf8a612c0d501c623ceb726ec428918ba38299e6ddb2560
```

### FOOTBALL_DATA_ORG_KEY (European leagues - Premier League, La Liga, etc.)
```
499d44325a7e48968f5dc9bd62541e7d
```

### NODE_ENV
```
production
```

## Steps:

1. Click "Add New" for each variable
2. Enter the Name and Value
3. Select "Production", "Preview", and "Development" environments
4. Click "Save"
5. Redeploy your project after adding all variables

## After Adding Variables

Run this command to trigger a new deployment:
```bash
git commit --allow-empty -m "Trigger redeploy with env vars"
git push
```

Or redeploy from Vercel Dashboard > Deployments > Click "..." > Redeploy
