# 🔧 Vercel Database Connection Fix Guide

## Problem
Hindi maka-connect ang Vercel deployment sa Supabase database kahit tama yung credentials.

## Root Cause
Vercel uses **serverless functions** (AWS Lambda) na:
- Creates new connection per request
- Hindi persistent connection
- Kailangan ng **connection pooler** para efficient

## Solution: Use Supabase Connection Pooler

### Step 1: Get Connection Strings from Supabase

1. Go to: https://supabase.com/dashboard
2. Select project: `ovwghqsgmtwpsgdgszia`
3. Click **Settings** (gear icon sa left sidebar)
4. Click **Database**
5. Scroll down to **"Connection string"** section

#### You'll see 2 tabs:

**Tab 1: "Transaction Mode"** (for serverless/Vercel)
```
Port: 6543
Format: postgresql://postgres.ovwghqsgmtwpsgdgszia:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```
☝️ **Copy this for `DATABASE_URL`**

**Tab 2: "Session Mode"** (for migrations)
```
Port: 5432
Format: postgresql://postgres:[YOUR-PASSWORD]@db.ovwghqsgmtwpsgdgszia.supabase.co:5432/postgres
```
☝️ **Copy this for `DIRECT_URL`**

### Step 2: Update .env.local (Local Testing)

Replace yung password `[YOUR-PASSWORD]` with: `XploreNexus2026`

```env
# Transaction Mode - para sa Vercel (port 6543)
DATABASE_URL="postgresql://postgres.ovwghqsgmtwpsgdgszia:XploreNexus2026@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# Session Mode - para sa migrations (port 5432)
DIRECT_URL="postgresql://postgres:XploreNexus2026@db.ovwghqsgmtwpsgdgszia.supabase.co:5432/postgres?sslmode=require"
```

### Step 3: Update Vercel Environment Variables

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Go to: **Settings** → **Environment Variables**
4. Add/Update these (ALL ENVIRONMENTS: Production, Preview, Development):

```
DATABASE_URL = postgresql://postgres.ovwghqsgmtwpsgdgszia:XploreNexus2026@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1

DIRECT_URL = postgresql://postgres:XploreNexus2026@db.ovwghqsgmtwpsgdgszia.supabase.co:5432/postgres?sslmode=require

NEXT_PUBLIC_SUPABASE_URL = https://ovwghqsgmtwpsgdgszia.supabase.co

NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = sb_publishable_vzZnL-LiqDIk_oXNbNJjGA_iXCnzuH-

JWT_SECRET = generate-a-32-character-random-string-for-security
```

**IMPORTANT NOTES:**
- ✅ `DATABASE_URL` must use **port 6543** (pooler endpoint)
- ✅ Must have `pgbouncer=true` parameter
- ✅ Must have `connection_limit=1` for serverless
- ✅ `DIRECT_URL` uses **port 5432** (direct connection)
- ✅ Apply to ALL environments (Production, Preview, Development)

### Step 4: Verify Supabase Settings

1. In Supabase Dashboard → Settings → Database
2. Under **Connection pooling**:
   - ✅ Ensure "Connection poolers" is **enabled**
   - ✅ Connection pool size should be > 0 (you have 15)
3. Under **Network Restrictions**:
   - ✅ Should allow all IPs (or specifically allow Vercel IPs)

### Step 5: Redeploy to Vercel

**Option A: From Vercel Dashboard**
1. Go to **Deployments** tab
2. Click the **"..."** menu on latest deployment
3. Click **"Redeploy"**
4. Check **"Use existing Build Cache"** is unchecked
5. Click **Redeploy**

**Option B: From Terminal**
```bash
# Force new deployment
git add .
git commit -m "fix: use Supabase connection pooler for Vercel"
git push
```

### Step 6: Test the Deployment

1. Wait for deployment to complete
2. Open your deployed site
3. Try to sign in
4. Check Vercel logs: **Deployments → Click deployment → Functions tab**
5. Look for `PRISMA_DB_HOST=` log (should show pooler host)

## Troubleshooting

### Still getting connection errors?

**Check 1: Verify environment variables are set**
```bash
# In Vercel project settings
Settings → Environment Variables
# Make sure DATABASE_URL and DIRECT_URL are there
```

**Check 2: Check Vercel Function Logs**
```
Vercel Dashboard → Deployments → [Click latest] → Functions
# Look for database connection errors
```

**Check 3: Verify Connection String Format**
- Port 6543 ✅
- Contains `pgbouncer=true` ✅
- Contains `connection_limit=1` ✅
- Password is correct ✅

**Check 4: Test locally first**
```bash
# Update .env.local with pooler connection
npm run dev
# Try to sign in on localhost:3000
```

## Key Differences

| Environment | Port | Endpoint | Use Case |
|-------------|------|----------|----------|
| **Serverless (Vercel)** | 6543 | `aws-0-ap-southeast-1.pooler.supabase.com` | Runtime queries |
| **Direct (Migrations)** | 5432 | `db.ovwghqsgmtwpsgdgszia.supabase.co` | Prisma migrations |

## Why This Fixes It

1. **Vercel = Serverless**: Each request creates a new database connection
2. **Connection Limits**: Supabase has max connections (~200 for free tier)
3. **Without Pooler**: Vercel quickly exhausts connections → "Can't reach database"
4. **With Pooler**: PgBouncer reuses connections → No exhaustion ✅

## Success Indicators

✅ Sign in works on deployed site
✅ No "Can't reach database" errors
✅ Vercel function logs show: `PRISMA_DB_HOST=aws-0-ap-southeast-1.pooler.supabase.com`
✅ Database operations complete successfully
