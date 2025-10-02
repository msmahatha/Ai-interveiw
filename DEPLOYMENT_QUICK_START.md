# Quick Deployment Guide

## Render + Netlify Deployment

Deploy your AI Interview Assistant to production:

### 🚀 Quick Start

1. **Run the deployment helper:**
   ```bash
   ./deploy-helper.sh
   ```

2. **Test your builds:**
   ```bash
   ./test-build.sh
   ```

3. **Follow the detailed guide:**
   See `RENDER_NETLIFY_DEPLOYMENT.md` for step-by-step instructions.

### 📋 What You Need

- GitHub repository
- MongoDB Atlas account
- Firebase project
- Google Gemini API key
- Render account (for backend)
- Netlify account (for frontend)

### ⚡ Deployment Architecture

```
Frontend (Netlify) ←→ Backend (Render) ←→ MongoDB Atlas
       ↓                    ↓
Firebase Auth         Google Gemini API
```

### 🔧 Configuration Files

- `render.yaml` - Backend deployment configuration
- `netlify.toml` - Frontend deployment configuration
- `.env.render.example` - Backend environment variables template
- `.env.netlify.example` - Frontend environment variables template

### 🎯 URLs After Deployment

- **Backend**: `https://your-service-name.onrender.com`
- **Frontend**: `https://your-app-name.netlify.app`
- **Health Check**: `https://your-service-name.onrender.com/health`

### 🔄 Continuous Deployment

Both services automatically deploy when you push to the main branch:

```bash
git add .
git commit -m "Update application"
git push origin main
```

---

For detailed instructions, see `RENDER_NETLIFY_DEPLOYMENT.md`