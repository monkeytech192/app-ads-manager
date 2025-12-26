#!/bin/bash

echo "🚀 Starting Vercel + Railway Deployment Setup..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if git is initialized
if [ ! -d .git ]; then
    echo -e "${BLUE}📦 Initializing Git repository...${NC}"
    git init
    echo -e "${GREEN}✅ Git initialized${NC}"
fi

# Check if remote exists
if ! git remote | grep -q origin; then
    echo ""
    echo -e "${BLUE}🔗 Please enter your GitHub repository URL:${NC}"
    echo "Example: https://github.com/yourusername/ads-manager-brutalist.git"
    read -p "GitHub URL: " GITHUB_URL
    
    git remote add origin "$GITHUB_URL"
    echo -e "${GREEN}✅ Remote added${NC}"
fi

# Add all files
echo ""
echo -e "${BLUE}📝 Adding files to git...${NC}"
git add .

# Commit
echo ""
echo -e "${BLUE}💾 Creating commit...${NC}"
git commit -m "Setup: Vercel + Railway deployment configuration"

# Push
echo ""
echo -e "${BLUE}⬆️  Pushing to GitHub...${NC}"
git branch -M main
git push -u origin main

echo ""
echo -e "${GREEN}✅ Code pushed to GitHub successfully!${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${BLUE}📋 NEXT STEPS:${NC}"
echo ""
echo "1️⃣  Setup MongoDB Atlas:"
echo "   → https://cloud.mongodb.com"
echo "   → Create M0 Free Cluster in Singapore"
echo "   → Get connection string"
echo ""
echo "2️⃣  Deploy Backend to Railway:"
echo "   → https://railway.app"
echo "   → New Project → Deploy from GitHub"
echo "   → Select your repository"
echo "   → Add environment variables (see DEPLOY_VERCEL_RAILWAY.md)"
echo ""
echo "3️⃣  Deploy Frontend to Vercel:"
echo "   → https://vercel.com/new"
echo "   → Import your GitHub repository"
echo "   → Add VITE_API_URL environment variable"
echo ""
echo "4️⃣  Read full guide: DEPLOY_VERCEL_RAILWAY.md"
echo ""
echo -e "${GREEN}🎉 Setup complete! Happy deploying!${NC}"
