# Deploy to Vercel

Complete guide for deploying your TinyFish Flask application to Vercel.

## Prerequisites

1. **GitHub account** - Your code must be on GitHub
2. **Vercel account** - Sign up at https://vercel.com (free tier available)
3. **Mino API Key** - Your API key from https://mino.ai

## Step-by-Step Deployment

### Step 1: Push to GitHub

Make sure your code is on GitHub:

```bash
# Check git status
git status

# If you have uncommitted changes:
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### Step 2: Sign Up for Vercel

1. Go to **https://vercel.com**
2. Click **"Sign Up"** or **"Log In"**
3. Sign up with **GitHub** (recommended - easiest integration)
4. Authorize Vercel to access your repositories

### Step 3: Create New Project

1. In Vercel dashboard, click **"Add New..."** → **"Project"**
2. Find and select your **TinyFish repository**
3. Click **"Import"**

### Step 4: Configure Project

Vercel should auto-detect Python, but verify these settings:

| Setting | Value |
|--------|-------|
| **Framework Preset** | `Other` |
| **Root Directory** | `./` (leave as default) |
| **Build Command** | (leave empty) |
| **Output Directory** | (leave empty) |
| **Install Command** | (leave empty - Vercel handles this) |

**Important**: Vercel will automatically:
- Detect `api/index.py` as the serverless function
- Use `@vercel/python` runtime
- Install dependencies from `requirements.txt`

### Step 5: Add Environment Variables

Click **"Environment Variables"** and add:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `MINO_API_KEY` | `sk-mino-kyyCNJHechyq8fR9q22EQFxs5TE3IcXf` | Production, Preview, Development |
| `DB_PATH` | `/tmp/price_monitor.db` | Production, Preview (optional) |

**Note**: 
- Vercel's filesystem is read-only except `/tmp`
- Files in `/tmp` are ephemeral (deleted after function execution)
- For production, consider using a cloud database

### Step 6: Deploy!

1. Click **"Deploy"**
2. Wait 1-2 minutes for the build to complete
3. Your app will be live at: `https://your-project-name.vercel.app`

## 🎉 You're Done!

Once deployment completes:
- ✅ Your app is live!
- ✅ Vercel provides free SSL automatically
- ✅ Auto-deploys on every git push to main branch

## Verify Deployment

1. Visit your app URL
2. Test the homepage loads
3. Try a text search
4. Check browser console for errors

## Monitor Your App

- **Deployments**: View all deployments in Vercel dashboard
- **Logs**: Click on a deployment → "Functions" → View logs
- **Analytics**: Enable Vercel Analytics for performance monitoring
- **Metrics**: CPU, Memory usage in dashboard

## ⚠️ Important Notes

### Function Timeout

- **Hobby Plan**: 10 seconds (free tier)
- **Pro Plan**: 60 seconds (current config)
- **Mino API calls**: Can take 30-60 seconds

**Solutions**:
- Upgrade to Pro plan for 60s timeout
- Optimize Mino API calls
- Consider breaking into smaller operations

### File System Limitations

- **Read-only filesystem** (except `/tmp`)
- **Database files**: Use `/tmp/` for SQLite (ephemeral)
- **Uploads**: Use `/tmp/` for temporary storage

**For Production**:
- Use cloud database (Vercel Postgres, Supabase, etc.)
- Use cloud storage for uploads (Vercel Blob, S3, Cloudinary)

### Static Files

- Static files in `/static` are served automatically
- Cached for 1 year (configured in `vercel.json`)
- No additional configuration needed

## Auto-Deploy

Vercel automatically deploys when you:
- Push to main branch
- Merge pull requests (creates preview deployments)
- Create new branches (creates preview deployments)

## Updating Your Deployment

After making changes:

```bash
# Commit your changes
git add .
git commit -m "Your commit message"
git push origin main
```

Vercel will automatically:
1. Detect the push
2. Trigger a new deployment
3. Build and deploy your changes
4. Update your live site (after successful build)

## Custom Domain

1. Go to your project → **Settings** → **Domains**
2. Add your domain
3. Follow DNS configuration instructions
4. Vercel provides free SSL automatically

## Troubleshooting

### Issue: Function timeout errors
**Symptoms**: Requests fail after 10-60 seconds

**Solutions**:
- Upgrade to Vercel Pro plan (60s timeout)
- Optimize Mino API calls
- Implement request queuing
- Use background jobs for long operations

### Issue: Static files not loading
**Symptoms**: CSS/JS files return 404

**Solutions**:
- Verify `vercel.json` routes are correct
- Check that files exist in `/static` directory
- Clear browser cache
- Check Vercel build logs

### Issue: Database errors
**Symptoms**: SQLite errors, permission denied

**Solutions**:
- Use `/tmp/price_monitor.db` for temporary storage
- Migrate to cloud database (Vercel Postgres, Supabase, etc.)
- Update `DB_PATH` environment variable

### Issue: Module not found errors
**Symptoms**: Import errors in Vercel logs

**Solutions**:
- Verify `requirements.txt` includes all dependencies
- Check that `api/index.py` correctly imports from parent directory
- Review Vercel build logs for missing packages

### Issue: CORS errors
**Symptoms**: Browser console shows CORS errors

**Solutions**:
- Verify `flask-cors` is installed
- Check CORS configuration in `app.py`
- Ensure Vercel headers are properly configured

## Vercel Plans

### Hobby (Free)
- ✅ 100GB bandwidth/month
- ✅ Automatic SSL
- ✅ Preview deployments
- ⚠️ 10s function timeout
- ⚠️ Limited resources

### Pro ($20/month)
- ✅ 60s function timeout
- ✅ Better performance
- ✅ Team collaboration
- ✅ Advanced analytics

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Community**: https://github.com/vercel/vercel/discussions
- **Status**: https://www.vercel-status.com

## Next Steps

1. ✅ Deploy to Vercel (you're doing this now!)
2. 🔄 Set up custom domain (optional)
3. 💾 Consider PostgreSQL for production (instead of SQLite)
4. 📈 Monitor and optimize
5. 🚀 Scale as needed

Good luck! 🚀

