# Build Fix - Google Fonts SSL Issue

## Problem
Build fails locally with:
```
unable to verify the first certificate
Failed to fetch fonts from Google Fonts
```

## Why This Happens
Your local Node.js environment has SSL certificate validation issues when fetching Google Fonts during build.

## Solutions

### Option 1: Skip Local Build (Recommended)
Just push to GitHub and let Vercel build it. Vercel doesn't have this SSL issue.

```bash
git add .
git commit -m "feat: add instant meeting and copy invite link"
git push
```

### Option 2: Temporary SSL Fix (Not Recommended)
Set environment variable to disable SSL verification:
```bash
# Windows PowerShell
$env:NODE_TLS_REJECT_UNAUTHORIZED='0'
pnpm run build

# Windows CMD
set NODE_TLS_REJECT_UNAUTHORIZED=0
pnpm run build
```

**⚠️ Warning:** This disables SSL verification which is a security risk. Only use for local testing.

### Option 3: Use Local Fonts (Better Long-term Solution)
Download fonts and serve them locally instead of from Google Fonts. This avoids the SSL issue entirely.

## Vercel Deployment
✅ **Good News:** This SSL issue does NOT affect Vercel deployment. Vercel has proper SSL certificates configured.

Your code is correct. Just push to GitHub and Vercel will build successfully! 🚀
