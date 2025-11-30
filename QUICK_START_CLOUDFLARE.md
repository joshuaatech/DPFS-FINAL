# Quick Start: Cloudflare Workers (5 minutes)

## Why Switch to Cloudflare?

✅ **No 250MB limit** - Unlike Vercel  
✅ **Free** - 100,000 requests/day  
✅ **Fast** - Global edge network  
✅ **Simple** - Just JavaScript  

## 🚀 Deploy in 5 Steps

### 1. Install Wrangler (1 minute)

```bash
npm install -g wrangler
```

Or use npx (no install needed):
```bash
npx wrangler deploy
```

### 2. Login to Cloudflare (30 seconds)

```bash
wrangler login
```

Opens browser to authenticate.

### 3. Navigate to Worker Directory (10 seconds)

```bash
cd cloudflare-worker
```

### 4. Set ML Service URL (30 seconds)

```bash
wrangler secret put ML_SERVICE_URL
# Enter your Railway/Render ML service URL
# Example: https://your-service.railway.app
```

### 5. Deploy (1 minute)

```bash
wrangler deploy
```

**Done!** Your API is live on Cloudflare Workers.

## 📝 What You Get

- Worker URL: `https://disease-prediction-api.your-subdomain.workers.dev`
- API endpoints work immediately
- No size limits
- Global edge network

## 🔧 Configure Frontend

If your frontend is separate, update the API URL:

**Option 1: Set in HTML**
```html
<script>
  window.API_URL = 'https://your-worker.workers.dev/api';
</script>
```

**Option 2: Deploy frontend to Cloudflare Pages**
- Free, fast CDN
- Automatically works with Worker

## ✅ That's It!

Your API is now running on Cloudflare Workers with:
- No size limits
- Free tier (100k requests/day)
- Global edge network
- Simple JavaScript (no Python issues)

See `CLOUDFLARE_DEPLOYMENT.md` for detailed instructions.

