# Deploy to Railway

Railway is another excellent Vercel alternative with easy deployment and a generous free tier.

## Prerequisites

1. **GitHub account** - Your code must be on GitHub
2. **Railway account** - Sign up at https://railway.app (free)

## Step-by-Step Deployment

### Step 1: Push to GitHub

Make sure your code is on GitHub:

```bash
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

### Step 2: Create Railway Account

1. Go to https://railway.app
2. Click **"Start a New Project"**
3. Sign up with GitHub (recommended)
4. Authorize Railway to access your repositories

### Step 3: Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your TinyFish repository
4. Railway will automatically detect it's a Python app

### Step 4: Configure Deployment

Railway auto-detects Python, but you can verify:

1. Go to your service → **Settings**
2. **Build Command**: `pip install -r requirements.txt` (auto-detected)
3. **Start Command**: `python app.py` (auto-detected)
4. **Healthcheck Path**: `/` (optional)

### Step 5: Add Environment Variables

1. Go to your service → **Variables** tab
2. Click **"New Variable"** and add:

| Key | Value |
|-----|-------|
| `MINO_API_KEY` | `sk-mino-kyyCNJHechyq8fR9q22EQFxs5TE3IcXf` |
| `PORT` | `8080` (Railway sets this automatically, but good to have) |
| `DB_PATH` | `/tmp/price_monitor.db` |
| `PYTHONUNBUFFERED` | `1` |

### Step 6: Deploy

1. Railway automatically starts deploying when you connect the repo
2. Watch the build logs in real-time
3. Your app will be live at: `https://your-app-name.up.railway.app`

## Using Docker (Optional)

Railway supports Docker:

1. Railway will automatically detect your `Dockerfile`
2. No additional configuration needed
3. Just push your code with the Dockerfile

## Railway Free Tier

- **$5 free credit monthly** (enough for small apps)
- **No sleep** (unlike Render free tier)
- **512MB RAM**
- **1GB storage**
- **100GB bandwidth**

After free credits:
- **Hobby Plan**: $5/month - 512MB RAM, $5 credit
- **Pro Plan**: $20/month - Better resources

## Custom Domain

1. Go to your service → **Settings** → **Networking**
2. Click **"Generate Domain"** or **"Custom Domain"**
3. Add your domain and configure DNS
4. Railway provides free SSL automatically

## Database Options on Railway

Railway offers managed databases:

1. **PostgreSQL**:
   - Click **"New"** → **"Database"** → **"PostgreSQL"**
   - Free with $5 credit, then $5/month
   - Update code to use PostgreSQL

2. **MySQL**:
   - Also available
   - Similar pricing

3. **Redis**:
   - For caching
   - Available as add-on

## Monitoring & Logs

- **Logs**: Real-time logs in Railway dashboard
- **Metrics**: CPU, Memory, Network
- **Deployments**: View all deployments and rollback

## Troubleshooting

### Issue: Build fails
- Check build logs in Railway dashboard
- Verify `requirements.txt` is correct
- Check Python version compatibility

### Issue: App crashes
- View logs in Railway dashboard
- Verify environment variables
- Check that port matches Railway's PORT env var

### Issue: Out of credits
- Upgrade to paid plan
- Or optimize resource usage

## Auto-Deploy

Railway automatically deploys on git push to main branch. You can:
- **Manual Deploy**: Trigger from dashboard
- **Deploy specific branch**: Configure in settings
- **Preview Deployments**: For pull requests

## Rollback

1. Go to **"Deployments"** tab
2. Find previous successful deployment
3. Click **"Redeploy"**

## CLI Tool (Optional)

Railway has a CLI for advanced usage:

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy
railway up
```

## Support

- **Railway Docs**: https://docs.railway.app
- **Discord**: https://discord.gg/railway
- **Status**: https://status.railway.app

