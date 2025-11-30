# Cloudflare Worker - Disease Prediction API

Lightweight Cloudflare Worker that proxies requests to your ML service.

## Setup

### 1. Install Wrangler CLI

```bash
npm install -g wrangler
```

Or use npx:
```bash
npx wrangler deploy
```

### 2. Login to Cloudflare

```bash
wrangler login
```

### 3. Configure Environment Variable

Set your ML service URL:

```bash
wrangler secret put ML_SERVICE_URL
# Enter your ML service URL when prompted
# Example: https://your-service.railway.app
```

Or set it in `wrangler.toml`:
```toml
[vars]
ML_SERVICE_URL = "https://your-service.railway.app"
```

### 4. Deploy

```bash
wrangler deploy
```

## Configuration

### Environment Variables

- `ML_SERVICE_URL` (required) - Your ML service URL (Railway/Render)

### Routes

Update `wrangler.toml` with your domain or use the default `workers.dev` subdomain.

## API Endpoints

- `GET /api/` - Health check
- `GET /api/symptoms` - Get symptoms (proxied to ML service)
- `POST /api/predict` - Predict disease (proxied to ML service)

## Development

```bash
# Local development
npm run dev

# Deploy
npm run deploy

# View logs
npm run tail
```

## Architecture

```
User → Cloudflare Worker → ML Service (Railway/Render) → Response
```

The Cloudflare Worker:
- Handles CORS
- Proxies API requests to ML service
- Serves frontend (optional - can use Cloudflare Pages)
- No size limits (unlike Vercel's 250MB)

## Benefits

✅ **No size limits** - Cloudflare Workers have generous limits  
✅ **Fast** - Runs on Cloudflare's edge network  
✅ **Free tier** - 100,000 requests/day free  
✅ **Simple** - Just JavaScript, no Python dependencies  
✅ **Scalable** - Auto-scales globally  

## Frontend Deployment

You can deploy the frontend separately using:
- **Cloudflare Pages** (recommended) - Free, fast CDN
- Or keep it on Vercel and just use the Worker for API

## Troubleshooting

### Worker not connecting to ML service?
- Check `ML_SERVICE_URL` is set correctly
- Verify ML service is running and accessible
- Check CORS settings on ML service

### Getting CORS errors?
- Worker already handles CORS
- Make sure ML service also allows CORS

