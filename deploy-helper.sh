#!/bin/bash

# Render + Netlify Deployment Helper Script
# This script helps verify your deployment configuration

echo "🚀 AI Interview Assistant - Deployment Helper"
echo "============================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅ Found: $1${NC}"
        return 0
    else
        echo -e "${RED}❌ Missing: $1${NC}"
        return 1
    fi
}

# Function to check if environment variable is set
check_env() {
    if [ -z "${!1}" ]; then
        echo -e "${RED}❌ Missing environment variable: $1${NC}"
        return 1
    else
        echo -e "${GREEN}✅ Environment variable set: $1${NC}"
        return 0
    fi
}

echo -e "\n${YELLOW}📋 Checking Deployment Configuration...${NC}"

# Check deployment files
echo -e "\n🔧 Configuration Files:"
check_file "render.yaml"
check_file "netlify.toml"
check_file ".env.render.example"
check_file ".env.netlify.example"
check_file "backend/package.json"
check_file "package.json"

# Check backend structure
echo -e "\n🔧 Backend Structure:"
check_file "backend/src/server.ts"
check_file "backend/tsconfig.json"
check_file "backend/Dockerfile"

# Check if we're in a git repository
echo -e "\n📂 Git Repository:"
if [ -d ".git" ]; then
    echo -e "${GREEN}✅ Git repository initialized${NC}"
    
    # Check for remote
    if git remote -v | grep -q origin; then
        echo -e "${GREEN}✅ Git remote configured${NC}"
        echo "   Remote URL: $(git remote get-url origin)"
    else
        echo -e "${YELLOW}⚠️  No git remote configured${NC}"
    fi
else
    echo -e "${RED}❌ Not a git repository${NC}"
fi

# Check package.json scripts
echo -e "\n📦 Build Scripts:"
if [ -f "package.json" ]; then
    if grep -q '"build"' package.json; then
        echo -e "${GREEN}✅ Frontend build script found${NC}"
    else
        echo -e "${RED}❌ Frontend build script missing${NC}"
    fi
fi

if [ -f "backend/package.json" ]; then
    if grep -q '"build"' backend/package.json && grep -q '"start"' backend/package.json; then
        echo -e "${GREEN}✅ Backend build and start scripts found${NC}"
    else
        echo -e "${RED}❌ Backend scripts missing${NC}"
    fi
fi

# Environment variables check (for local development)
echo -e "\n🔒 Environment Configuration:"
echo "Check these files for required environment variables:"
echo "  - .env.render.example (Backend environment variables)"
echo "  - .env.netlify.example (Frontend environment variables)"

# Deployment readiness
echo -e "\n${YELLOW}🚀 Pre-deployment Checklist:${NC}"
echo "Before deploying, ensure you have:"
echo "  □ MongoDB Atlas cluster set up"
echo "  □ Firebase project with Authentication enabled"
echo "  □ Google Gemini API key"
echo "  □ Render account created"
echo "  □ Netlify account created"
echo "  □ GitHub repository is public or connected to both services"

echo -e "\n${YELLOW}📚 Next Steps:${NC}"
echo "1. Follow the RENDER_NETLIFY_DEPLOYMENT.md guide"
echo "2. Set up your Render backend service first"
echo "3. Then set up your Netlify frontend site"
echo "4. Update CORS_ORIGIN after getting your Netlify URL"

echo -e "\n${GREEN}✨ Ready for deployment!${NC}"
echo -e "📖 See RENDER_NETLIFY_DEPLOYMENT.md for detailed instructions"