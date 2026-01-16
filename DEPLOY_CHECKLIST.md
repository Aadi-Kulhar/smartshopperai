# Vercel Deployment Checklist

Use this checklist to ensure everything is ready before deploying.

## Pre-Deployment Checklist

### ✅ Code Preparation
- [ ] All code changes committed to git
- [ ] `requirements.txt` includes all dependencies
- [ ] `vercel.json` is properly configured
- [ ] `api/index.py` handler is updated
- [ ] No hardcoded API keys in code (use environment variables)

### ✅ Files Verification
- [ ] `app.py` - Main Flask application
- [ ] `mino_integration.py` - Mino API client
- [ ] `api/index.py` - Vercel serverless handler
- [ ] `vercel.json` - Vercel configuration
- [ ] `requirements.txt` - Python dependencies
- [ ] `templates/index.html` - Frontend template
- [ ] `static/app.js` - Frontend JavaScript
- [ ] `static/styles.css` - Frontend styles
- [ ] `.gitignore` - Excludes venv, .env, etc.

### ✅ GitHub Setup
- [ ] Repository created on GitHub
- [ ] Code pushed to GitHub
- [ ] Main branch is `main` or `master`

### ✅ Vercel Account
- [ ] Vercel account created
- [ ] GitHub account connected to Vercel

## Deployment Steps

1. **Go to Vercel Dashboard**: https://vercel.com
2. **Click "Add New..." → "Project"**
3. **Import your GitHub repository**
4. **Configure project**:
   - Framework: Other
   - Root Directory: `./`
   - Build Command: (empty)
   - Output Directory: (empty)
   - Install Command: `pip install -r requirements.txt`
5. **Add Environment Variables**:
   - `MINO_API_KEY`: Your Mino API key
   - `DB_PATH`: `/tmp/price_monitor.db` (optional)
6. **Click "Deploy"**
7. **Wait for build to complete**
8. **Test your deployment**

## Post-Deployment Verification

- [ ] Homepage loads correctly
- [ ] Static files (CSS/JS) load properly
- [ ] Text search works
- [ ] Image search works
- [ ] No console errors in browser
- [ ] Check Vercel function logs for errors

## Quick Commands

```bash
# Check git status
git status

# Commit changes
git add .
git commit -m "Ready for Vercel deployment"

# Push to GitHub
git push origin main

# Or use the provided script
chmod +x push_to_github.sh
./push_to_github.sh
```

## Troubleshooting Quick Reference

| Issue | Solution |
|-------|----------|
| Build fails | Check `requirements.txt` and Vercel logs |
| 404 on static files | Verify `vercel.json` routes |
| Function timeout | Increase `maxDuration` in `vercel.json` |
| Import errors | Check `api/index.py` path imports |
| Database errors | Use `/tmp/` for file paths or cloud DB |

