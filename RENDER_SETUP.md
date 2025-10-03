# Render Environment Variables Setup

## 🎉 Backend Successfully Deployed!

Your backend is now live at: **https://ai-interview-backend-3wh5.onrender.com**

## ⚠️ Firebase Configuration Required

To fix the Firebase error and enable authentication, set these environment variables in your Render dashboard:

### 1. Go to Render Dashboard
- Open your service: `crisp-backend`
- Go to **Environment** tab
- Add the following variables:

### 2. Required Environment Variables

```bash
# Database (Required for data storage)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-interview?retryWrites=true&w=majority

# JWT Secret (Required for authentication tokens)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

# Firebase Service Account (Required for backend authentication)
FIREBASE_PROJECT_ID=ai-interview-419f3
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@ai-interview-419f3.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
...your full private key here (multiple lines)...
...keep all newlines and formatting...
-----END PRIVATE KEY-----"

# AI Service (Optional - for AI features)
GEMINI_API_KEY=AIzaSyDFuOkPycgjznXPfFobFOi0pqdsN08blZs
```

### 3. Important Notes for Firebase Private Key

**The private key must be formatted correctly:**

1. **Copy from Firebase Console:**
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate new private key"
   - Download the JSON file
   - Copy the `private_key` value (including quotes and newlines)

2. **Format for Render:**
   ```
   "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...actual key content...\n-----END PRIVATE KEY-----\n"
   ```

3. **Keep the quotes and `\n` characters** - they're essential for proper parsing

### 4. Test Configuration

After setting all variables:
1. **Redeploy** your service (Environment → Manual Deploy)
2. **Check logs** for "Firebase Admin initialized successfully"
3. **Test authentication** on your frontend

## 🚀 Next Steps

1. **Set environment variables** in Render dashboard
2. **Update Netlify** with new backend URL: `https://ai-interview-backend-3wh5.onrender.com/api`
3. **Test your application** - authentication should now work!

## 📝 Current Status

✅ Backend deployed and running  
✅ CORS configured for Netlify  
✅ TypeScript build successful  
⚠️ Firebase needs environment variables  
⚠️ Database needs MongoDB connection  

Once you set the environment variables, your full-stack application will be live! 🎉