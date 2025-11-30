# Cloudflare Deployment Guide

Complete guide to deploy the Disease Prediction System on Cloudflare.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Step 1: Backend Setup (ML Service)](#step-1-backend-setup-ml-service)
4. [Step 2: Deploy Worker API](#step-2-deploy-worker-api)
5. [Step 3: Deploy Frontend](#step-3-deploy-frontend)
6. [Step 4: Configuration](#step-4-configuration)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)
9. [Advanced Features](#advanced-features)

---

## Architecture Overview

```
┌─────────────────────┐
│   Frontend (Pages)  │  ← Cloudflare Pages
│   HTML/CSS/JS       │    (static assets)
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  Worker API         │  ← Cloudflare Workers
│  (Proxy & Routing)  │    (serverless edge)
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  ML Service Backend │  ← Railway/Render
│  (Python Flask)     │    (external host)
└─────────────────────┘
```

### Components

- **Frontend**: Static HTML/CSS/JS deployed to Cloudflare Pages
- **Worker**: Serverless function on Cloudflare Workers that proxies API requests
- **ML Service**: Python Flask backend deployed on Railway or Render

---

## Prerequisites

Before deployment, ensure you have:

1. **Cloudflare Account** - Free tier is sufficient
   - https://dash.cloudflare.com/

2. **Wrangler CLI** - Cloudflare's command-line tool
   ```bash
   npm install -g wrangler
   ```

3. **Git** - For version control
   ```bash
   git --version
   ```

4. **Node.js 18+** - For running build tools
   ```bash
   node --version
   ```

5. **Python Backend** - Deployed somewhere (Railway, Render, Heroku, etc.)

### Installation Steps

```bash
# Install Wrangler globally
npm install -g wrangler

# Verify installation
wrangler --version

# Login to Cloudflare
wrangler login
```

---

## Step 1: Backend Setup (ML Service)

The ML service (Flask app) should be deployed on an external platform like Railway or Render.

### Option A: Deploy on Railway (Recommended)

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Deploy ML Service**
   ```bash
   # In the DPFS-FINAL directory
   railway login
   railway link
   railway up
   ```

3. **Get ML Service URL**
   - Note the deployed URL: `https://your-project.railway.app`

### Option B: Deploy on Render

1. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub

2. **Create Web Service**
   - Connect your GitHub repo
   - Select `ml_service` directory
   - Set Start Command: `gunicorn ml_service.app:app`
   - Deploy

3. **Get ML Service URL**
   - Note the deployed URL: `https://your-service.onrender.com`

### Verify ML Service is Running

```bash
# Test the backend
curl https://your-ml-service-url/health

# Expected response:
# {"status": "ok", "message": "ML service is running"}
```

---

## Step 2: Deploy Worker API

### 1. Setup Local Environment

```bash
# Navigate to project directory
cd c:\Users\SOORAJ\DPFS-FINAL

# Install dependencies
npm install

# Verify wrangler installation
wrangler --version
```

### 2. Configure Wrangler

Edit `wrangler.toml` and set your ML service URL:

```toml
[vars]
ML_SERVICE_URL = "https://your-ml-service-url.railway.app"
```

### 3. Test Locally

```bash
# Start local development server
wrangler dev

# In another terminal, test the API
curl http://localhost:8787/api/
```

You should see a welcome page with API information.

### 4. Deploy to Cloudflare

```bash
# Deploy the Worker
wrangler deploy

# Output will show:
# ✓ Uploaded disease-prediction-system
# ✓ Published to https://disease-prediction-system.<account>.workers.dev
```

### 5. Get Your Worker URL

Your API is now live at: `https://disease-prediction-system.<account>.workers.dev`

---

## Step 3: Deploy Frontend

### Option A: Deploy to Cloudflare Pages (Recommended)

```bash
# Deploy the public folder to Cloudflare Pages
wrangler pages deploy public/

# Or if using Pages directly in Dashboard:
# 1. Go to Cloudflare Dashboard → Pages
# 2. Create new project
# 3. Connect GitHub repo
# 4. Set build directory to `public/`
# 5. Deploy
```

Your frontend will be available at: `https://disease-prediction-system.pages.dev`

### Option B: Deploy Frontend Separately

If you want to use a custom domain:

```bash
# Deploy to a separate Pages project
wrangler pages deploy public/ --project-name disease-prediction-ui

# Access at: https://disease-prediction-ui.pages.dev
```

---

## Step 4: Configuration

### 4.1 Set ML Service URL in Worker

**Via Wrangler CLI:**
```bash
# Set environment variable
wrangler secret put ML_SERVICE_URL

# Paste your ML service URL when prompted
# https://your-ml-service-url.railway.app
```

**Via Cloudflare Dashboard:**

1. Go to Cloudflare Dashboard
2. Navigate to Workers → disease-prediction-system
3. Click "Settings" → "Variables"
4. Add variable:
   - Name: `ML_SERVICE_URL`
   - Value: `https://your-ml-service-url.railway.app`
5. Click "Encrypt and save"

### 4.2 Update Frontend API Endpoint

Edit `public/index.html` and update the API base URL:

```javascript
// Find this section in index.html
const API_BASE_URL = 'https://disease-prediction-system.<account>.workers.dev/api';

// Or if deploying together:
const API_BASE_URL = '/api';
```

### 4.3 Custom Domain (Optional)

1. **Add Custom Domain to Worker:**
   ```bash
   wrangler route add https://api.yourdomain.com/* --pattern https://api.yourdomain.com/*
   ```

2. **Add Custom Domain to Pages:**
   - Cloudflare Dashboard → Pages → disease-prediction-ui → Custom domains
   - Add `yourdomain.com`

---

## Testing

### Test Health Endpoint

```bash
# Check API health
curl https://disease-prediction-system.<account>.workers.dev/api/

# Expected response:
# {
#   "status": "healthy",
#   "timestamp": "2024-01-15T10:30:00Z",
#   "ml_service": {
#     "status": "connected",
#     ...
#   }
# }
```

### Test Symptoms Endpoint

```bash
curl https://disease-prediction-system.<account>.workers.dev/api/symptoms

# Expected response:
# {
#   "symptoms": ["fever", "cough", "fatigue", ...]
# }
```

### Test Prediction Endpoint

```bash
curl -X POST https://disease-prediction-system.<account>.workers.dev/api/predict \
  -H "Content-Type: application/json" \
  -d '{"symptoms": ["fever", "cough", "fatigue"]}'

# Expected response:
# {
#   "disease": "Common Cold",
#   "confidence": 0.85,
#   ...
# }
```

### Test Frontend

Open in browser:
```
https://disease-prediction-system.pages.dev
```

---

## Troubleshooting

### Issue: "ML_SERVICE_URL not configured"

**Solution:**
```bash
# Set the environment variable
wrangler secret put ML_SERVICE_URL

# Verify it's set
wrangler secret list
```

### Issue: "Failed to connect to ML service"

**Possible causes:**
1. ML service URL is incorrect
2. ML service is down or offline
3. CORS issues between Worker and ML service

**Solution:**
```bash
# Test ML service directly
curl https://your-ml-service-url/health

# If it fails, check:
# 1. Service is deployed and running
# 2. URL is correct
# 3. Firewall/security group allows access
```

### Issue: Frontend shows blank page

**Solution:**
1. Check browser console for errors (F12)
2. Verify API endpoint in `index.html`
3. Ensure Worker is deployed and running
4. Test API endpoint directly

### Issue: CORS errors

**Solution:**
The Worker already handles CORS. If you still see errors:

1. Check that Worker is returning correct CORS headers:
```bash
curl -I https://disease-prediction-system.<account>.workers.dev/api/
```

2. Look for `Access-Control-Allow-Origin: *` header

3. If missing, redeploy Worker:
```bash
wrangler deploy
```

### View Logs

```bash
# View real-time logs
wrangler tail

# Filter by route
wrangler tail --status error

# Tail specific format
wrangler tail --format json
```

---

## Advanced Features

### 1. Enable Caching (Optional)

Edit `wrangler.toml`:

```toml
[[routes]]
pattern = "example.com/api/symptoms"
zone_name = "example.com"
# Add cache settings in Cloudflare Dashboard
```

### 2. Add Analytics

```toml
[[analytics_engine_bindings]]
dataset = "disease_prediction_events"
```

### 3. Add KV Storage for Caching

```toml
[[kv_namespaces]]
binding = "CACHE"
id = "your-kv-namespace-id"
```

Use in Worker:
```javascript
// Cache API response
const cacheKey = `symptoms:${Date.now()}`;
await env.CACHE.put(cacheKey, responseData);
```

### 4. Multiple Environments

Deploy to staging:
```bash
wrangler deploy --env staging
```

### 5. Scheduled Events

```toml
[triggers.crons]
crons = ["0 0 * * *"]  # Daily at midnight
```

Add to Worker:
```javascript
export async function scheduled(event, env, ctx) {
  // Health check every day
  ctx.waitUntil(checkMLServiceHealth(env.ML_SERVICE_URL));
}
```

---

## Deployment Checklist

- [ ] ML Service deployed and running
- [ ] ML Service URL verified
- [ ] Wrangler installed and logged in
- [ ] `wrangler.toml` updated with correct URL
- [ ] Worker deployed (`wrangler deploy`)
- [ ] Worker health check passes
- [ ] Frontend deployed to Pages
- [ ] Frontend can reach Worker API
- [ ] All endpoints tested
- [ ] Custom domain configured (optional)
- [ ] Monitoring/logs setup (optional)

---

## Quick Deploy Commands

```bash
# One-time setup
npm install -g wrangler
wrangler login

# Development
wrangler dev

# Production deployment
wrangler deploy
wrangler pages deploy public/

# Set ML Service URL
wrangler secret put ML_SERVICE_URL

# View logs
wrangler tail

# View deployment status
wrangler deployments list
```

---

## Additional Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/)
- [Railway.app Documentation](https://docs.railway.app/)
- [Render Deployment Guide](https://render.com/docs)

---

## Support

If you encounter issues:

1. Check logs: `wrangler tail`
2. Review [Troubleshooting](#troubleshooting) section
3. Test each component separately
4. Verify environment variables are set
5. Check Cloudflare Dashboard for errors

---

**Last Updated:** November 2024  
**Version:** 1.0.0
