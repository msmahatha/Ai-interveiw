# Deployment Guide: Render + Netlify

This guide will walk you through deploying your AI Interview Assistant with the backend on Render and frontend on Netlify.

## Overview

- **Backend**: Node.js/Express API deployed on Render
- **Frontend**: React/Vite SPA deployed on Netlify
- **Database**: MongoDB Atlas (cloud)
- **Authentication**: Firebase Auth
- **AI Service**: Google Gemini API

## Prerequisites

- GitHub repository with your code
- MongoDB Atlas account and cluster
- Firebase project with Authentication enabled
- Google Gemini API key
- Render account
- Netlify account

## Part 1: Backend Deployment on Render

### Step 1: Create Render Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `ai-interview-backend` (or your preferred name)
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: Leave empty (uses repository root)
   - **Build Command**: `cd backend && npm ci && npm run build`
   - **Start Command**: `cd backend && npm start`

### Step 2: Configure Environment Variables

In your Render service settings, add these environment variables:

```bash
# Required - Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-interview?retryWrites=true&w=majority

# Required - Authentication
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters

# Required - Firebase Admin SDK
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----"

# Required - AI Service
GEMINI_API_KEY=your-gemini-api-key

# Required - CORS (update after Netlify deployment)
CORS_ORIGIN=https://your-app-name.netlify.app

# System
NODE_ENV=production
PORT=10000
```

### Step 3: Deploy Backend

1. Click "Create Web Service"
2. Wait for the initial deployment to complete
3. Note your service URL: `https://your-service-name.onrender.com`
4. Test the deployment: `https://your-service-name.onrender.com/health`

## Part 2: Frontend Deployment on Netlify

### Step 1: Create Netlify Site

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub repository
4. Configure build settings:
   - **Base directory**: Leave empty
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

### Step 2: Configure Environment Variables

In Netlify Site Settings → Environment Variables, add:

```bash
# Required - API URL (from Step 1.3)
VITE_API_URL=https://your-render-service-name.onrender.com/api

# Required - Firebase Web Config
VITE_FIREBASE_API_KEY=your-firebase-web-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-firebase-app-id

# Optional - AI Service (if using on frontend)
VITE_GEMINI_API_KEY=your-gemini-api-key

# Optional - App Configuration
VITE_APP_NAME="AI Interview Assistant"
VITE_APP_VERSION="1.0.0"
```

### Step 3: Deploy Frontend

1. Click "Deploy site"
2. Wait for deployment to complete
3. Note your site URL: `https://your-app-name.netlify.app`

### Step 4: Update CORS Configuration

1. Go back to your Render service
2. Update the `CORS_ORIGIN` environment variable with your Netlify URL:
   ```
   CORS_ORIGIN=https://your-app-name.netlify.app
   ```
3. Redeploy the Render service

## Part 3: Verification and Testing

### Health Checks

1. **Backend Health**: `https://your-service-name.onrender.com/health`
2. **Frontend**: `https://your-app-name.netlify.app`
3. **API Connection**: Check browser network tab for API calls

### Common Issues and Solutions

#### Backend Issues

**Build Failures:**
- Check that `backend/package.json` has correct scripts
- Ensure `typescript` is in dependencies or devDependencies
- Verify Node.js version compatibility

**CORS Errors:**
- Ensure `CORS_ORIGIN` matches your Netlify URL exactly
- Check for typos in environment variables
- Allow deploy preview URLs in CORS configuration

**Database Connection:**
- Verify MongoDB Atlas connection string
- Check IP whitelist (0.0.0.0/0 for cloud deployment)
- Test connection string locally

#### Frontend Issues

**Build Failures:**
- Check environment variables are prefixed with `VITE_`
- Ensure all dependencies are listed in `package.json`
- Verify Vite configuration

**API Connection Issues:**
- Verify `VITE_API_URL` points to correct Render service
- Check CORS configuration on backend
- Test API endpoints directly

## Part 4: Custom Domain (Optional)

### Netlify Custom Domain

1. Go to Site Settings → Domain management
2. Add custom domain
3. Configure DNS records as instructed

### Render Custom Domain

1. Go to Service → Settings → Custom Domain
2. Add your domain
3. Configure DNS records as instructed

## Part 5: Monitoring and Maintenance

### Render Monitoring

- Check service logs for errors
- Monitor response times and uptime
- Set up health check alerts

### Netlify Monitoring

- Monitor build logs
- Check Core Web Vitals
- Set up form notifications if needed

### Database Monitoring

- Monitor MongoDB Atlas metrics
- Set up connection alerts
- Regular backup verification

## Security Checklist

- [ ] Environment variables are not committed to repository
- [ ] Firebase security rules are configured
- [ ] CORS is properly configured
- [ ] HTTPS is enabled on both services
- [ ] Database access is restricted to application
- [ ] API rate limiting is enabled
- [ ] Sensitive data is properly validated

## Troubleshooting

### Logs Access

**Render Logs:**
```bash
# View recent logs in Render dashboard
# Or use Render CLI
render logs --service your-service-name
```

**Netlify Logs:**
- Available in Netlify dashboard under "Functions" or "Site overview"

### Common Commands

**Redeploy Backend:**
- Trigger manual deploy in Render dashboard

**Redeploy Frontend:**
- Push to main branch or trigger manual deploy in Netlify

**Clear Build Cache:**
- Render: Clear build cache in service settings
- Netlify: Clear cache in site settings

## Support and Resources

- [Render Documentation](https://render.com/docs)
- [Netlify Documentation](https://docs.netlify.com/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)

---

## Quick Deployment Commands

After setting up both services, you can deploy updates by simply pushing to your main branch:

```bash
git add .
git commit -m "Deploy updates"
git push origin main
```

Both services will automatically deploy the latest changes!