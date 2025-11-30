# Cloudflare Frontend Setup

## The Issue
Cloudflare Workers can't easily serve large HTML files. The frontend should be deployed separately on **Cloudflare Pages**.

## Solution: Deploy Frontend to Cloudflare Pages

### Step 1: Deploy Frontend to Cloudflare Pages

1. **Go to Cloudflare Dashboard** → Pages → Create a project
2. **Connect your GitHub repository**
3. **Build Settings:**
   - **Framework preset**: None
   - **Build command**: (leave empty)
   - **Output directory**: `public`
   - **Root directory**: `/` (root)

4. **Deploy**
   - Cloudflare will deploy your frontend
   - You'll get a URL like: `https://your-project.pages.dev`

### Step 2: Update Frontend to Use Worker API

Update `public/index.html` to use your Worker URL:

**Option A: Set API URL in HTML (before closing `</head>` tag):**
```html
<script>
  window.API_URL = 'https://your-worker.workers.dev/api';
</script>
```

**Option B: Or update the API_URL constant in the script:**
```javascript
const API_URL = 'https://your-worker.workers.dev/api';
```

### Step 3: (Optional) Link Worker to Pages

If you want the Worker to handle API routes on your Pages domain:

1. Go to Pages → Your Project → Functions
2. Add a `functions` directory
3. Create `functions/api/[[path]].js` that proxies to your Worker

**OR** simpler: Just use the Worker URL directly in the frontend.

## Alternative: Use Worker for Everything

If you want everything in one Worker, you can:

1. **Deploy frontend to a CDN** (like jsDelivr, unpkg, or GitHub Pages)
2. **Update Worker to fetch and serve the HTML** from the CDN URL

But **Cloudflare Pages is the recommended approach** - it's free, fast, and designed for this.

## Quick Setup

1. **Deploy Worker** (already done) → Get Worker URL
2. **Deploy Frontend to Pages** → Get Pages URL  
3. **Update frontend** → Set `API_URL` to Worker URL
4. **Done!** → Visit Pages URL

## Architecture

```
User → Cloudflare Pages (Frontend) → Cloudflare Worker (API) → ML Service (Railway)
```

This is the recommended architecture for Cloudflare deployments.

