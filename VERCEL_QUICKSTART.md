# 🚀 Vercel Quick Start

Deploy your TinyFish app to Vercel in 5 minutes!

## ✅ Pre-Deployment Checklist

- [ ] Code is committed to git
- [ ] Code is pushed to GitHub
- [ ] You have your Mino API key ready

## 📋 Quick Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Ready for Vercel"
git push origin main
```

### 2. Deploy on Vercel

1. Go to **https://vercel.com** → Sign up with GitHub
2. Click **"Add New..."** → **"Project"**
3. Select your **TinyFish repository**
4. Click **"Import"**
5. Add environment variable:
   - **Key**: `MINO_API_KEY`
   - **Value**: `sk-mino-kyyCNJHechyq8fR9q22EQFxs5TE3IcXf`
6. Click **"Deploy"**
7. Wait 1-2 minutes
8. Your app is live! 🎉

## 🔍 Verify

Visit your deployment URL and test:
- ✅ Homepage loads
- ✅ Text search works
- ✅ Image search works

## ⚠️ Important Notes

- **Timeout**: Free tier = 10s, Pro = 60s (Mino API can take 30-60s)
- **Database**: Use `/tmp/` for SQLite (ephemeral) or cloud DB for production
- **Auto-deploy**: Every git push to main automatically deploys

## 🆘 Need Help?

See `VERCEL_DEPLOYMENT.md` for detailed guide and troubleshooting.

