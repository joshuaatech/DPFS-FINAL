# Disease Prediction System - Cloudflare Deployment

**Quick Deploy to Cloudflare in 5 minutes!**

This project is fully configured for easy deployment on Cloudflare, combining a serverless Worker API with Cloudflare Pages frontend hosting.

## 🚀 Quick Start

### 1. Prerequisites
```bash
# Check versions
node --version    # Should be 18+
npm --version     # Should be 8+
git --version
```

### 2. Install Wrangler
```bash
npm install -g wrangler
wrangler login      # Authenticate with your Cloudflare account
```

### 3. Deploy ML Backend
First, deploy your Flask ML service to Railway or Render:

**Railway:**
```bash
npm install -g railway
railway login
railway link
railway up
```

Get your URL: `https://your-project.railway.app`

### 4. Deploy Worker API
```bash
# From project root directory
wrangler deploy
```

This deploys your API at: `https://disease-prediction-system.<account>.workers.dev`

### 5. Set ML Service URL
```bash
wrangler secret put ML_SERVICE_URL
# Paste your ML service URL when prompted
```

### 6. Deploy Frontend
```bash
wrangler pages deploy public/
```

Frontend is now live at: `https://disease-prediction-system.pages.dev`

## 📁 Project Structure

```
DPFS-FINAL/
├── public/                    # Frontend (HTML/CSS/JS)
│   └── index.html            # Main frontend application
├── cloudflare-worker/         # Cloudflare Worker code
│   ├── src/
│   │   └── index.js          # Worker implementation
│   ├── package.json
│   └── wrangler.toml
├── ml_service/                # Flask ML backend
│   ├── app.py                # Flask application
│   ├── requirements.txt
│   └── Procfile              # For Railway/Render deployment
├── dataset/                   # ML training data
├── saved_model/               # Trained ML models
├── wrangler.toml              # Main Worker configuration
├── package.json               # NPM dependencies
├── CLOUDFLARE_DEPLOYMENT_GUIDE.md  # Detailed guide
└── deploy_cloudflare.bat      # Windows quick deploy script
```

## 🔧 Configuration

### Environment Variables
Set these in Cloudflare Dashboard or via CLI:

```bash
# Essential
wrangler secret put ML_SERVICE_URL

# Optional (already has defaults)
wrangler secret put ENVIRONMENT production
wrangler secret put API_TIMEOUT 30000
```

### Update Frontend API Endpoint
Edit `public/index.html` - find and update:
```javascript
const API_BASE_URL = 'https://disease-prediction-system.<account>.workers.dev/api';
```

## 🧪 Testing

### Test API Health
```bash
curl https://disease-prediction-system.<account>.workers.dev/api/
```

### Test Symptoms Endpoint
```bash
curl https://disease-prediction-system.<account>.workers.dev/api/symptoms
```

### Test Prediction
```bash
curl -X POST https://disease-prediction-system.<account>.workers.dev/api/predict \
  -H "Content-Type: application/json" \
  -d '{"symptoms": ["fever", "cough"]}'
```

## 📝 Available Scripts

```bash
# Development
npm run dev              # Start local Wrangler server

# Deployment
npm run deploy           # Deploy Worker to Cloudflare
npm run deploy:pages     # Deploy Pages frontend
npm run publish          # Alias for deploy

# Other
npm run build            # (no-op, just for compatibility)
```

## 🐛 Troubleshooting

### "ML_SERVICE_URL not configured"
```bash
wrangler secret put ML_SERVICE_URL
wrangler deploy
```

### "Failed to connect to ML service"
1. Verify ML service is running: `curl https://your-ml-service-url/health`
2. Check URL in `wrangler.toml` or dashboard
3. Ensure firewall allows Cloudflare access

### Frontend shows blank page
1. Check browser console (F12)
2. Verify API endpoint URL in `index.html`
3. Test Worker directly: curl the API endpoint
4. Check CORS headers are being returned

### Local dev not working
```bash
# Kill any existing process on port 8787
# Restart with verbose output
wrangler dev --local --debug
```

## 📊 Architecture

```
User Browser
    ↓
Cloudflare Pages (Frontend)
    ↓
Cloudflare Worker (API Proxy)
    ↓
ML Service (Flask Backend)
    ├── /health
    ├── /symptoms
    ├── /predict
    └── /models
```

## 🔐 Security Features

✓ CORS headers properly configured  
✓ Request validation (JSON validation)  
✓ Error handling without exposing internals  
✓ Timeout protection (30 seconds)  
✓ Environment variables for sensitive data  
✓ Support for secrets management  

## 📚 Documentation

- **Full Guide**: See `CLOUDFLARE_DEPLOYMENT_GUIDE.md`
- **Wrangler Docs**: https://developers.cloudflare.com/workers/wrangler/
- **Workers API**: https://developers.cloudflare.com/workers/
- **Pages Guide**: https://developers.cloudflare.com/pages/

## 🚢 Deployment Options

### Option 1: All-in-One (Recommended)
- Worker hosts API and serves frontend
- Single deployment point
- Simplest setup

**Deploy:**
```bash
wrangler deploy              # Deploy Worker
wrangler pages deploy public/ # Deploy Pages (optional)
```

### Option 2: Separate Deployments
- Worker only for API
- Pages separately for frontend
- Independent scaling

**Deploy:**
```bash
wrangler deploy
wrangler pages deploy public/ --project-name disease-prediction-ui
```

### Option 3: Custom Domain
- Use your own domain
- Professional setup

**Setup:**
1. Add custom domain in Cloudflare Dashboard
2. Update API endpoint in frontend
3. CNAME to workers.dev

## 💰 Cost Estimate

**Monthly cost on Cloudflare free tier:**
- Workers: **$0** (first 100k requests/day free)
- Pages: **$0** (unlimited)
- KV: **$0** (first 1GB free)

**With ML service on Railway free tier:**
- Railway: **$0** (up to 500MB)

**Total: $0** 🎉

## 🎯 Next Steps

1. [ ] Deploy ML service (Railway/Render)
2. [ ] Get ML service URL
3. [ ] Install Wrangler: `npm install -g wrangler`
4. [ ] Login: `wrangler login`
5. [ ] Set ML URL: `wrangler secret put ML_SERVICE_URL`
6. [ ] Deploy: `npm run deploy`
7. [ ] Test: `curl https://disease-prediction-system.<account>.workers.dev/api/`
8. [ ] Deploy Pages: `npm run deploy:pages`

## 📧 Support

For issues or questions:
1. Check `CLOUDFLARE_DEPLOYMENT_GUIDE.md`
2. Review logs: `wrangler tail`
3. Test components individually
4. Check Cloudflare Dashboard for error messages

## 📄 License

MIT

---

**Ready to deploy?** Run `deploy_cloudflare.bat` (Windows) or follow the Quick Start above!

**Last Updated:** November 2024  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
