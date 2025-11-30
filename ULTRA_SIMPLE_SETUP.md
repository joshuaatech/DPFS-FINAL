# ⚡ GITHUB TO CLOUDFLARE - SUPER SIMPLE

**Push to GitHub → Automatically Deploy to Cloudflare**

---

## 3-STEP SETUP (5 minutes total)

### Step 1️⃣: Get Cloudflare Credentials

**A. Get API Token:**
- Go to: https://dash.cloudflare.com/profile/api-tokens
- Click "Create Token"
- Choose "Edit Cloudflare Workers"
- Copy the token

**B. Get Account ID:**
- Go to: https://dash.cloudflare.com/
- Look at URL bar: `https://dash.cloudflare.com/[THIS_IS_YOUR_ID]`
- Copy it

**C. Get ML Service URL:**
- From Railway/Render dashboard
- Example: `https://your-service.railway.app`

---

### Step 2️⃣: Add GitHub Secrets

Your GitHub repo → Settings → Secrets → Actions

Add these 3 secrets:

1. **Name**: `CLOUDFLARE_API_TOKEN`
   **Value**: [Your API token from Step 1A]

2. **Name**: `CLOUDFLARE_ACCOUNT_ID`
   **Value**: [Your account ID from Step 1B]

3. **Name**: `ML_SERVICE_URL`
   **Value**: [Your ML service URL from Step 1C]

---

### Step 3️⃣: Push to GitHub

```bash
git add .
git commit -m "Ready to deploy"
git push origin main
```

**Done! 🎉 Check your live site:**
- API: `https://disease-prediction-system.[account-id].workers.dev/api/`
- Frontend: `https://disease-prediction-ui.pages.dev`

---

## 🔄 How It Works

Every time you push:
```
git push → GitHub Actions Runs → Deploys to Cloudflare → Live!
```

---

## 📋 Checklist

- [ ] Created Cloudflare API token
- [ ] Got Cloudflare Account ID
- [ ] Have ML service URL
- [ ] Added all 3 GitHub Secrets
- [ ] Pushed code to GitHub
- [ ] Checked GitHub Actions for status

---

## ✅ Verify It Worked

1. **GitHub Actions:**
   Go to your repo → Actions tab → See green checkmark

2. **Your API:**
   ```bash
   curl https://disease-prediction-system.[account-id].workers.dev/api/
   ```
   Should show status info

3. **Your Frontend:**
   Open in browser: `https://disease-prediction-ui.pages.dev`

---

## 🆘 Quick Troubleshooting

**Red X on GitHub Actions?**
1. Go to Actions → Click the failed run
2. Scroll down to see error
3. Usually missing secret or wrong value

**API says "ML_SERVICE_URL not configured"?**
1. Check the GitHub Secret name is EXACTLY `ML_SERVICE_URL`
2. Verify the URL is correct
3. Push again after fixing

**Can't see live site?**
1. Wait 2-3 minutes for deployment
2. Check if GitHub Actions finished (green checkmark)
3. Try clearing browser cache

---

## 💡 From Now On

Just code normally:

```bash
# Make changes
code src/file.js

# Commit and push
git add .
git commit -m "Added feature"
git push

# ✅ Automatically deploys!
```

No more manual deployment steps!

---

**Status**: ✅ Fully Automated  
**Next**: Go to GitHub Secrets and add 3 values, then push!
