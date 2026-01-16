#!/bin/bash
# Script to push code to GitHub

echo "🚀 Pushing Smart Shopping Dashboard to GitHub..."
echo ""

# Check if remote is already set
if git remote get-url origin &> /dev/null; then
    echo "✅ Remote 'origin' is already configured"
    REMOTE_URL=$(git remote get-url origin)
    echo "   Remote URL: $REMOTE_URL"
    echo ""
    read -p "Do you want to push to this remote? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git push -u origin main
        echo ""
        echo "✅ Code pushed successfully!"
    else
        echo "Push cancelled."
    fi
else
    echo "📝 No GitHub remote configured yet."
    echo ""
    echo "To push to GitHub, you need to:"
    echo ""
    echo "1. Create a new repository on GitHub:"
    echo "   - Go to https://github.com/new"
    echo "   - Name it (e.g., 'smart-shopping' or 'tinyfish-dashboard')"
    echo "   - Don't initialize with README, .gitignore, or license"
    echo "   - Click 'Create repository'"
    echo ""
    echo "2. Copy the repository URL (HTTPS or SSH)"
    echo ""
    echo "3. Run this command (replace YOUR_USERNAME and REPO_NAME):"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git"
    echo "   git push -u origin main"
    echo ""
    echo "Or, if you have the URL ready, enter it below:"
    read -p "GitHub repository URL: " REPO_URL
    if [ ! -z "$REPO_URL" ]; then
        git remote add origin "$REPO_URL"
        git push -u origin main
        echo ""
        echo "✅ Code pushed successfully to $REPO_URL"
    else
        echo "No URL provided. Exiting."
    fi
fi

