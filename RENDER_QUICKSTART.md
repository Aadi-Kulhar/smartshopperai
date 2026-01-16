# 🚀 Render Quick Start Guide

Follow these steps to deploy your TinyFish app to Render in under 5 minutes!

## ✅ Pre-Deployment Checklist

Before starting, make sure:
- [ ] Your code is committed to git
- [ ] Your code is pushed to GitHub
- [ ] You have your Mino API key ready

## 📋 Step-by-Step Instructions

### Step 1: Push to GitHub (if not already done)

```bash
# Check git status
git status

# If you have uncommitted changes:
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### Step 2: Sign Up for Render

1. Go to **https://render.com**
2. Click **"Get Started for Free"**
3. Sign up with **GitHub** (recommended - easiest integration)
4. Authorize Render to access your repositories

### Step 3: Create New Web Service

1. In Render dashboard, click **"New +"** button (top right)
2. Select **"Web Service"**
3. Click **"Connect account"** if you haven't connected GitHub yet
4. Find and select your **TinyFish repository**
5. Click **"Connect"**

### Step 4: Configure Your Service

Fill in these settings:

| Field | Value |
|------|-------|
| **Name** | `tinyfish` or `smart-shopping` (your choice) |
| **Region** | Choose closest to you (e.g., `Oregon (US West)`) |
| **Branch** | `main` (or your default branch) |
| **Root Directory** | Leave **empty** (or `./` if needed) |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `python app.py` |
| **Plan** | `Free` (you can upgrade later) |

### Step 5: Add Environment Variables

Click the **"Environment"** tab, then click **"Add Environment Variable"** for each:

1. **MINO_API_KEY**
   - Key: `MINO_API_KEY`
   - Value: `sk-mino-kyyCNJHechyq8fR9q22EQFxs5TE3IcXf`

2. **PORT** (optional, Render sets this automatically)
   - Key: `PORT`
   - Value: `8080`

3. **PYTHONUNBUFFERED** (optional, for better logs)
   - Key: `PYTHONUNBUFFERED`
   - Value: `1`

### Step 6: Deploy!

1. Scroll down and click **"Create Web Service"**
2. Render will start building your app
3. Watch the build logs in real-time
4. Wait 3-5 minutes for the first deployment
5. Your app will be live at: `https://your-service-name.onrender.com`

## 🎉 You're Done!

Once deployment completes:
- ✅ Your app is live!
- ✅ Render provides free SSL automatically
- ✅ Auto-deploys on every git push to main branch

## 🔍 Verify Deployment

1. Visit your app URL
2. Test the homepage loads
3. Try a text search
4. Check browser console for errors

## 📊 Monitor Your App

- **Logs**: View real-time logs in Render dashboard
- **Metrics**: CPU, Memory usage
- **Deployments**: See all deployments and rollback if needed

## ⚠️ Free Tier Notes

- **Sleeps after 15 minutes** of inactivity
- Wakes up automatically on next request (~30 second delay)
- **512MB RAM** - enough for your app
- **750 hours/month** - plenty for testing

To avoid sleep, upgrade to **Starter Plan ($7/month)** - always-on, no sleep.

## 🔄 Auto-Deploy

Render automatically deploys when you:
- Push to main branch
- Merge pull requests (if configured)

## 🆘 Troubleshooting

### Build fails?
- Check build logs in Render dashboard
- Verify `requirements.txt` is correct
- Make sure all dependencies are listed

### App crashes?
- Check logs tab in Render dashboard
- Verify environment variables are set correctly
- Ensure `MINO_API_KEY` is set

### App sleeps too much?
- Upgrade to paid plan ($7/month) for always-on
- Or use a service like UptimeRobot to ping every 5 minutes

## 📚 Need More Help?

- Full guide: See `DEPLOY_RENDER.md`
- Render docs: https://render.com/docs
- Render community: https://community.render.com

## 🎯 Next Steps

1. ✅ Deploy to Render (you're doing this now!)
2. 🔄 Set up custom domain (optional)
3. 💾 Consider PostgreSQL for production (instead of SQLite)
4. 📈 Monitor and optimize

Good luck! 🚀

