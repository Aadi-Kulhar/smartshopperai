# Deployment Guide for Vercel

## Prerequisites

1. **GitHub account** - Sign up at https://github.com
2. **Vercel account** - Sign up at https://vercel.com (free tier available)
3. **Mino API Key** - Your API key from https://mino.ai

## Step-by-Step Deployment

### Step 1: Prepare Your Code

Make sure your code is ready:
```bash
# Check that all files are committed
git status

# If not, commit your changes
git add .
git commit -m "Prepare for Vercel deployment"
```

### Step 2: Push to GitHub

If you haven't already, push your code to GitHub:

**Option A: Using the provided script**
```bash
chmod +x push_to_github.sh
./push_to_github.sh
```

**Option B: Manual push**
```bash
# Create a new repository on GitHub first at https://github.com/new
# Then run:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy on Vercel

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com
   - Sign in with your GitHub account (recommended for easy integration)

2. **Create New Project**
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Select the repository you just pushed

3. **Configure Project Settings**
   - **Framework Preset**: `Other` (or leave as auto-detected)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: (leave empty - no build needed)
   - **Output Directory**: (leave empty)
   - **Install Command**: `pip install -r requirements.txt`

4. **Add Environment Variables**
   Click "Environment Variables" and add:
   
   | Variable Name | Value | Environment |
   |--------------|-------|-------------|
   | `MINO_API_KEY` | `sk-mino-kyyCNJHechyq8fR9q22EQFxs5TE3IcXf` | Production, Preview, Development |
   | `DB_PATH` | `/tmp/price_monitor.db` | Production, Preview (optional) |

   **Note**: For production, consider using Vercel's environment variable encryption.

5. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete (usually 1-2 minutes)
   - Your app will be live at `https://your-project-name.vercel.app`

### Step 4: Verify Deployment

1. Visit your deployment URL
2. Test the search functionality
3. Check browser console for any errors
4. Test both text and image search

## Environment Variables

### Required
- **`MINO_API_KEY`**: Your Mino AI API key (starts with `sk-mino-`)

### Optional
- **`DB_PATH`**: Database file path (defaults to `price_monitor.db` in project root)
  - For Vercel: Use `/tmp/price_monitor.db` (temporary storage)
  - **Note**: Vercel's filesystem is read-only except `/tmp`, and `/tmp` is ephemeral
  - For persistent storage, consider using a cloud database (see below)

## Important Notes

### ⚠️ Limitations on Vercel

1. **File System**: 
   - Vercel serverless functions have a read-only filesystem (except `/tmp`)
   - Database files in `/tmp` are **ephemeral** (deleted after function execution)
   - **Solution**: Use a cloud database for production (see recommendations below)

2. **Function Timeout**:
   - Default timeout is 10 seconds (Hobby plan)
   - Current config: 60 seconds (Pro plan required)
   - Mino API calls can take 30-60 seconds
   - **Solution**: Consider upgrading to Pro plan or optimize API calls

3. **Upload Storage**:
   - Uploaded images are stored temporarily
   - Consider using cloud storage (AWS S3, Cloudinary, etc.) for production

### 🔧 Production Recommendations

1. **Database**: Replace SQLite with:
   - **Vercel Postgres** (recommended - integrates seamlessly)
   - **Supabase** (free tier available)
   - **PlanetScale** (MySQL)
   - **MongoDB Atlas** (NoSQL)

2. **File Storage**: Use cloud storage for uploads:
   - **Vercel Blob Storage**
   - **AWS S3**
   - **Cloudinary**
   - **Uploadcare**

3. **Caching**: Consider adding:
   - Redis for caching search results
   - Vercel Edge Config for configuration

## Local Development

For local development and testing:

```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variable
export MINO_API_KEY="sk-mino-kyyCNJHechyq8fR9q22EQFxs5TE3IcXf"

# Run the app
python app.py
```

The app will run on http://localhost:8080

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
- Migrate to cloud database (see recommendations above)
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

## Monitoring

- **Vercel Dashboard**: View deployments, logs, and analytics
- **Function Logs**: Check Vercel dashboard → Your Project → Functions → View logs
- **Analytics**: Enable Vercel Analytics for performance monitoring

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Community**: https://github.com/vercel/vercel/discussions
- **Mino AI Docs**: https://docs.mino.ai

