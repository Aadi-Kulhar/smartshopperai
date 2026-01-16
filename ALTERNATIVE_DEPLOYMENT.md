# Alternative Deployment Options

Since Vercel is down, here are the best alternatives for deploying your TinyFish Smart Shopping platform.

## 🚀 Quick Comparison

| Platform | Free Tier | Sleep? | Easiest? | Best For |
|----------|-----------|--------|----------|----------|
| **Render** | ✅ Yes | ⚠️ 15min | ⭐⭐⭐⭐⭐ | Quick deployment, free tier |
| **Railway** | ✅ $5 credit | ❌ No | ⭐⭐⭐⭐⭐ | No sleep, easy setup |
| **Fly.io** | ✅ Yes | ❌ No | ⭐⭐⭐⭐ | Docker, global edge |
| **PythonAnywhere** | ✅ Yes | ⚠️ Limited | ⭐⭐⭐ | Python-focused |
| **Heroku** | ❌ No | N/A | ⭐⭐⭐ | Classic option (paid) |

## 📋 Recommended: Render or Railway

**For fastest deployment**: Use **Render** (most similar to Vercel)
**For no-sleep free tier**: Use **Railway** ($5 monthly credit)

## 📚 Detailed Guides

- **[DEPLOY_RENDER.md](./DEPLOY_RENDER.md)** - Step-by-step Render deployment
- **[DEPLOY_RAILWAY.md](./DEPLOY_RAILWAY.md)** - Step-by-step Railway deployment  
- **[DEPLOY_FLYIO.md](./DEPLOY_FLYIO.md)** - Docker-based Fly.io deployment

## 🐳 Docker Support

All platforms support Docker. A `Dockerfile` is included in this repo.

**To use Docker:**
1. Platforms will auto-detect your `Dockerfile`
2. No additional configuration needed
3. Just push your code

## 🔧 Quick Start (Choose One)

### Option 1: Render (Recommended for Ease)

```bash
# 1. Push to GitHub
git push origin main

# 2. Go to https://render.com
# 3. New → Web Service → Connect GitHub repo
# 4. Configure:
#    - Build: pip install -r requirements.txt
#    - Start: python app.py
# 5. Add environment variables
# 6. Deploy!
```

**See [DEPLOY_RENDER.md](./DEPLOY_RENDER.md) for full guide**

### Option 2: Railway (Recommended for No Sleep)

```bash
# 1. Push to GitHub
git push origin main

# 2. Go to https://railway.app
# 3. New Project → Deploy from GitHub
# 4. Select your repo
# 5. Add environment variables
# 6. Deploy!
```

**See [DEPLOY_RAILWAY.md](./DEPLOY_RAILWAY.md) for full guide**

### Option 3: Fly.io (Docker-based)

```bash
# 1. Install Fly CLI
brew install flyctl  # or see DEPLOY_FLYIO.md

# 2. Login
flyctl auth login

# 3. Launch
flyctl launch

# 4. Set secrets
flyctl secrets set MINO_API_KEY=sk-mino-...

# 5. Deploy
flyctl deploy
```

**See [DEPLOY_FLYIO.md](./DEPLOY_FLYIO.md) for full guide**

## 🔑 Required Environment Variables

All platforms need these:

| Variable | Value | Required |
|----------|-------|----------|
| `MINO_API_KEY` | `sk-mino-kyyCNJHechyq8fR9q22EQFxs5TE3IcXf` | ✅ Yes |
| `PORT` | `8080` | ⚠️ Auto-set (but good to have) |
| `DB_PATH` | `/tmp/price_monitor.db` | ❌ Optional |
| `PYTHONUNBUFFERED` | `1` | ❌ Optional (for logging) |

## ⚠️ Important Notes

### Database Considerations

- **SQLite on `/tmp/`**: Works but data is ephemeral (lost on restart)
- **For production**: Use managed databases:
  - Render: PostgreSQL
  - Railway: PostgreSQL/MySQL
  - Fly.io: Postgres

### File Uploads

- Uploaded images are stored temporarily
- For production, consider:
  - Cloud storage (S3, Cloudinary)
  - Render/Railway volumes (paid plans)

### Timeouts

- Mino API calls can take 30-60 seconds
- Most platforms support this, but check limits:
  - Render: 30s default (can increase)
  - Railway: 60s default
  - Fly.io: Configurable

## 🆘 Troubleshooting

### Common Issues

1. **Build fails**
   - Check `requirements.txt` has all dependencies
   - Verify Python version compatibility
   - Check platform logs

2. **App crashes**
   - Verify environment variables are set
   - Check that PORT matches platform's expectation
   - Review application logs

3. **Database errors**
   - Use `/tmp/` for SQLite (ephemeral)
   - Or migrate to managed database

4. **Static files not loading**
   - Verify static files are in repository
   - Check platform's static file serving configuration

## 📞 Need Help?

- **Render**: https://render.com/docs
- **Railway**: https://docs.railway.app
- **Fly.io**: https://fly.io/docs

## 🔄 Switching Platforms

All platforms use similar deployment patterns:
1. Connect GitHub repository
2. Configure build/start commands
3. Add environment variables
4. Deploy

You can easily switch between platforms if needed!

