# Cloudflare Pages Deployment Fix

## Issue
Wrangler can't find the entry point because it's running from the root directory.

## Solution

You have two options:

### Option 1: Deploy from cloudflare-worker directory (Recommended)

Update your Cloudflare Pages build settings:

**Build Command:**
```bash
cd cloudflare-worker && npx wrangler deploy
```

**Root Directory:**
```
cloudflare-worker
```

### Option 2: Use root-level wrangler.toml

I've created `wrangler.toml` in the root that points to the worker files.

**Build Command:**
```bash
npx wrangler deploy
```

**Root Directory:**
```
. (root)
```

## Environment Variables

Set `ML_SERVICE_URL` in Cloudflare Pages:
1. Go to Pages → Your Project → Settings → Environment Variables
2. Add: `ML_SERVICE_URL` = Your Railway/Render ML service URL

## Quick Fix for Current Deployment

Update your Cloudflare Pages build settings:

**Build Command:**
```bash
cd cloudflare-worker && npx wrangler deploy
```

**Root Directory:**
```
cloudflare-worker
```

This will make Wrangler run from the correct directory where `wrangler.toml` and `src/index.js` are located.

