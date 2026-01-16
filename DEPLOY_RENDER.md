# Deploy to Render

Render is a great alternative to Vercel with excellent Flask support and a free tier.

## Prerequisites

1. **GitHub account** - Your code must be on GitHub
2. **Render account** - Sign up at https://render.com (free)

## Step-by-Step Deployment

### Step 1: Push to GitHub

Make sure your code is on GitHub:

```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### Step 2: Create Render Account

1. Go to https://render.com
2. Sign up with GitHub (recommended for easy integration)
3. Authorize Render to access your repositories

### Step 3: Create New Web Service

1. **Click "New +"** → **"Web Service"**
2. **Connect your GitHub repository**
   - Select your TinyFish repository
   - Click "Connect"
3. **Configure the service**:
   - **Name**: `tinyfish` or `smart-shopping` (your choice)
   - **Region**: Choose closest to you (e.g., `Oregon (US West)`)
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: Leave empty (or `./` if needed)
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python app.py`
   - **Plan**: `Free` (or upgrade if needed)

### Step 4: Add Environment Variables

Click "Environment" tab and add:

| Key | Value | Notes |
|-----|-------|-------|
| `MINO_API_KEY` | `sk-mino-kyyCNJHechyq8fR9q22EQFxs5TE3IcXf` | Your Mino API key |
| `PORT` | `8080` | Port for the app (Render sets this automatically, but good to have) |
| `DB_PATH` | `/tmp/price_monitor.db` | Database path (optional) |
| `PYTHONUNBUFFERED` | `1` | For better logging |

### Step 5: Deploy

1. Click **"Create Web Service"**
2. Render will:
   - Clone your repository
   - Install dependencies
   - Start your app
3. Wait 3-5 minutes for the first deployment
4. Your app will be live at: `https://your-service-name.onrender.com`

## Using Docker (Optional)

If you prefer Docker deployment:

1. In Render, select **"Docker"** as the runtime instead of Python
2. Render will automatically detect and use your `Dockerfile`
3. No need to specify build/start commands

## Render Free Tier Limitations

- **Sleeps after 15 minutes of inactivity** (wakes up on next request, ~30s delay)
- **512MB RAM**
- **0.1 CPU**
- **750 hours/month** (enough for always-on if you upgrade)

## Upgrade Options

To avoid sleep (always-on):
- **Starter Plan**: $7/month - No sleep, 512MB RAM
- **Standard Plan**: $25/month - Better performance

## Custom Domain

1. Go to your service → **Settings** → **Custom Domain**
2. Add your domain
3. Follow DNS configuration instructions
4. Render provides free SSL automatically

## Database Options on Render

For production, consider Render's managed databases:

1. **PostgreSQL** (recommended):
   - Go to **"New +"** → **"PostgreSQL"**
   - Free tier: 90 days, then $7/month
   - Update your code to use PostgreSQL instead of SQLite

2. **Redis** (for caching):
   - Useful for caching search results
   - Free tier available

## Monitoring & Logs

- **Logs**: Available in real-time in Render dashboard
- **Metrics**: CPU, Memory, Request count
- **Alerts**: Set up email alerts for errors

## Troubleshooting

### Issue: App crashes on startup
- Check logs in Render dashboard
- Verify all environment variables are set
- Check that `requirements.txt` is correct

### Issue: App sleeps too often
- Upgrade to paid plan for always-on
- Or use a service like UptimeRobot to ping your app every 5 minutes

### Issue: Build fails
- Check build logs
- Verify Python version compatibility
- Ensure all dependencies are in `requirements.txt`

### Issue: Database errors
- Use `/tmp/` for SQLite (ephemeral)
- Or migrate to Render PostgreSQL

## Auto-Deploy

Render automatically deploys when you push to your main branch. You can also:
- **Manual Deploy**: Click "Manual Deploy" in dashboard
- **Deploy specific branch**: Configure in settings

## Rollback

If something goes wrong:
1. Go to **"Events"** tab
2. Find previous successful deployment
3. Click **"Rollback"**

## Support

- **Render Docs**: https://render.com/docs
- **Community**: https://community.render.com
- **Status**: https://status.render.com

