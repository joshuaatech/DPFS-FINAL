# Deploy Frontend to Cloudflare Pages

Your frontend is now configured to deploy automatically to Cloudflare Pages!

## What Happens Automatically

When you push to GitHub:
1. ✅ Worker API deploys to Cloudflare Workers
2. ✅ Frontend deploys to Cloudflare Pages
3. ✅ ML Service URL is configured

## Frontend Location

Your frontend files are in the `public/` directory:
- `public/index.html` - Main HTML file
- Inline CSS and JavaScript in the HTML

## Deployment URLs

After deployment, your frontend will be available at:
- **Pages URL**: `https://disease-prediction-ui.pages.dev`
- **Worker URL**: `https://dpfstest.soorajskumar004.workers.dev`

## Manual Frontend Deployment (Optional)

If you want to deploy just the frontend without pushing code:

```bash
npx wrangler pages deploy public/ --project-name disease-prediction-ui
```

## Frontend Configuration

The frontend automatically connects to the API at:
- Production: `https://dpfstest.soorajskumar004.workers.dev`

Update the API URL in `public/index.html` if needed (search for `API_URL` or similar).

## Troubleshooting

### Pages deployment fails
- Ensure you have Cloudflare API Token with Pages permissions
- Check that `CLOUDFLARE_API_TOKEN` secret is set in GitHub

### Frontend not updating
- Check GitHub Actions logs for errors
- Verify `public/` directory contains your files
- Clear browser cache (Ctrl+Shift+Delete)

### CORS errors from frontend
- The Worker already has CORS headers configured
- If issues persist, check `/cloudflare-worker/src/index.js` CORS configuration

## Next Steps

1. Push your changes: `git add . && git commit -m "Add Pages config" && git push`
2. Wait for GitHub Actions to complete (2-3 minutes)
3. Visit `https://disease-prediction-ui.pages.dev`
4. Test the disease prediction interface

That's it! Your full stack is now live:
- 🔵 **Frontend**: Cloudflare Pages
- 🟣 **API**: Cloudflare Workers  
- 🟡 **ML Backend**: Railway/Render (configure ML_SERVICE_URL)
