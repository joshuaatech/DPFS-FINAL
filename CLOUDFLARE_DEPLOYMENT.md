# Cloudflare Workers Deployment Guide

## Why Cloudflare Workers?

- ✅ **No 250MB limit** - Unlike Vercel, no function size restrictions
- ✅ **Free tier** - 100,000 requests/day
- ✅ **Fast** - Edge network, runs globally
- ✅ **Simple** - Just JavaScript, no Python dependencies needed
- ✅ **Scalable** - Auto-scales

## Quick Start

### Step 1: Install Wrangler

```bash
npm install -g wrangler
```

### Step 2: Login

```bash
wrangler login
```

### Step 3: Navigate to Worker Directory

```bash
cd cloudflare-worker
```

### Step 4: Set ML Service URL

```bash
wrangler secret put ML_SERVICE_URL
# Enter: https://your-ml-service.railway.app
```

### Step 5: Deploy

```bash
wrangler deploy
```

That's it! Your API is now live on Cloudflare Workers.

## Full Setup

### 1. Deploy ML Service First

Deploy your ML service to Railway or Render (see `HYBRID_DEPLOYMENT_GUIDE.md`).

Get the service URL (e.g., `https://your-service.railway.app`).

### 2. Configure Cloudflare Worker

```bash
cd cloudflare-worker

# Set ML service URL
wrangler secret put ML_SERVICE_URL
# Paste your ML service URL

# Or edit wrangler.toml and add:
# [vars]
# ML_SERVICE_URL = "https://your-service.railway.app"
```

### 3. Deploy Worker

```bash
wrangler deploy
```

You'll get a URL like: `https://disease-prediction-api.your-subdomain.workers.dev`

### 4. Deploy Frontend (Optional)

#### Option A: Cloudflare Pages (Recommended)

1. Go to Cloudflare Dashboard → Pages
2. Connect your GitHub repo
3. Build settings:
   - Framework: None
   - Build command: (leave empty)
   - Output directory: `public`
4. Deploy

#### Option B: Keep on Vercel

- Keep frontend on Vercel
- Update frontend to call Cloudflare Worker URL instead of `/api/`

### 5. Update Frontend API URL

If frontend is separate, update `public/index.html` to use your Cloudflare Worker URL:

```javascript
// Change from:
const API_URL = '/api';

// To:
const API_URL = 'https://your-worker.workers.dev/api';
```

## File Structure

```
cloudflare-worker/
├── src/
│   └── index.js          # Main worker code
├── wrangler.toml         # Cloudflare configuration
├── package.json          # Dependencies
└── README.md            # Worker documentation
```

## Environment Variables

Set in Cloudflare Dashboard or via CLI:

```bash
wrangler secret put ML_SERVICE_URL
```

## Testing

### Test Worker Locally

```bash
cd cloudflare-worker
wrangler dev
```

Visit: `http://localhost:8787/api/`

### Test Deployed Worker

```bash
curl https://your-worker.workers.dev/api/
```

## API Endpoints

All endpoints proxy to your ML service:

- `GET /api/` - Health check
- `GET /api/symptoms` - Get symptoms
- `POST /api/predict` - Predict disease

## Cost

**Free Tier:**
- 100,000 requests/day
- Unlimited requests on paid plans ($5/month)

**Total Cost: $0/month** (free tier sufficient for most use cases)

## Benefits Over Vercel

| Feature | Vercel | Cloudflare Workers |
|---------|--------|-------------------|
| Function Size Limit | 250 MB | No limit |
| Free Requests | Unlimited | 100k/day |
| Global Edge | Yes | Yes |
| Language | Python | JavaScript |
| Setup Complexity | Medium | Low |

## Troubleshooting

### Worker returns 500 error?
- Check `ML_SERVICE_URL` is set
- Verify ML service is running
- Check worker logs: `wrangler tail`

### CORS errors?
- Worker handles CORS automatically
- Make sure ML service also allows CORS

### Frontend can't connect?
- Update frontend API URL to Worker URL
- Check CORS settings

## Next Steps

1. Deploy ML service to Railway/Render
2. Deploy Cloudflare Worker
3. Deploy frontend to Cloudflare Pages (or keep on Vercel)
4. Update frontend to use Worker URL
5. Test everything!

Your app is now running on Cloudflare's global edge network! 🚀

