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
