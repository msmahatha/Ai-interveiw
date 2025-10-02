#!/bin/bash

# Quick test script for deployment verification
echo "🧪 Testing Deployment Configuration"
echo "=================================="

# Test backend build
echo -e "\n📦 Testing Backend Build..."
cd backend
if npm run build; then
    echo -e "✅ Backend builds successfully"
else
    echo -e "❌ Backend build failed"
    exit 1
fi

# Test frontend build
echo -e "\n📦 Testing Frontend Build..."
cd ..
if npm run build; then
    echo -e "✅ Frontend builds successfully"
else
    echo -e "❌ Frontend build failed"
    exit 1
fi

echo -e "\n🎉 All builds successful! Ready for deployment."
echo -e "📚 Run './deploy-helper.sh' for deployment checklist"