#!/bin/bash
# Script to change GitHub remote repository

echo "🔄 Changing GitHub Remote Repository"
echo ""

# Show current remote
echo "Current remote:"
git remote -v
echo ""

# Get new repository URL
read -p "Enter your new GitHub repository URL (e.g., https://github.com/username/repo.git): " NEW_REPO_URL

if [ -z "$NEW_REPO_URL" ]; then
    echo "❌ No URL provided. Exiting."
    exit 1
fi

# Remove old remote
echo ""
echo "Removing old remote..."
git remote remove origin

# Add new remote
echo "Adding new remote: $NEW_REPO_URL"
git remote add origin "$NEW_REPO_URL"

# Verify
echo ""
echo "✅ New remote configured:"
git remote -v
echo ""

# Ask if they want to push
read -p "Do you want to push to the new repository now? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Pushing to new repository..."
    git push -u origin main
    echo ""
    echo "✅ Successfully pushed to new repository!"
else
    echo ""
    echo "Remote changed. Push manually with:"
    echo "  git push -u origin main"
fi

