#!/bin/bash

echo "🔍 Checking Render Backend Environment Variables"
echo ""
echo "Expected Firebase Configuration:"
echo "FIREBASE_PROJECT_ID=ai-interview-419f3"
echo "FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@ai-interview-419f3.iam.gserviceaccount.com"
echo "FIREBASE_PRIVATE_KEY=(should start with -----BEGIN PRIVATE KEY-----)"
echo ""
echo "Testing backend endpoints..."
echo ""

echo "1. Testing basic health:"
curl -s "https://ai-interview-backend-3wh5.onrender.com/health" | jq

echo ""
echo "2. Testing environment configuration:"
curl -s "https://ai-interview-backend-3wh5.onrender.com/api/test" | jq

echo ""
echo "3. Testing Firebase initialization (once deployed):"
curl -s "https://ai-interview-backend-3wh5.onrender.com/api/firebase-debug" | jq