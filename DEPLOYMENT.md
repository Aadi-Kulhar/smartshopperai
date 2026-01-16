# Deployment Guide for Vercel

## Prerequisites

1. GitHub account
2. Vercel account (sign up at https://vercel.com)

## Deployment Steps

### 1. Push to GitHub

```bash
git commit -m "Initial commit: Smart Shopping Dashboard with Mino API integration"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to https://vercel.com and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)

### 3. Environment Variables

Add these environment variables in Vercel dashboard:

- `MINO_API_KEY`: Your Mino API key (sk-mino-...)
- `DB_PATH`: (optional) Database path for production

### 4. Important Notes

- The app uses serverless functions, so long-running operations (like Mino API calls) may need timeout adjustments
- Static files are served from the `/static` directory
- Database files are stored locally (consider using a cloud database for production)
- Upload directory is temporary (consider using cloud storage for production)

## Alternative: Local Development

For local development:

```bash
pip install -r requirements.txt
python app.py
```

The app will run on http://localhost:8080

## Troubleshooting

### Issue: Function timeout
- Increase `maxDuration` in `vercel.json`
- Consider breaking long operations into smaller chunks

### Issue: Static files not loading
- Ensure `vercel.json` routes are correct
- Check that static files are in the `/static` directory

### Issue: Database errors
- For production, use a cloud database (PostgreSQL, MongoDB, etc.)
- Update `mino_integration.py` to use the cloud database connection

