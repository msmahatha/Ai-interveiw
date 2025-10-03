# 🔧 Login Troubleshooting Guide

## Current Issue: Unable to Login

Based on your setup, here are the most likely causes and solutions:

## 🔍 **Step 1: Check Browser Console**
1. Open http://localhost:5178 in your browser
2. Open Developer Tools (F12 or Ctrl/Cmd+Shift+I)
3. Go to Console tab
4. Look for error messages related to:
   - Firebase initialization
   - Network errors
   - API connection issues

## 🔍 **Step 2: Common Issues & Solutions**

### **Issue A: Firebase Authentication Not Enabled**
**Symptoms**: "auth/operation-not-allowed" error

**Solution**:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `ai-interview-419f3`
3. Go to Authentication → Sign-in method
4. **Enable Email/Password** authentication
5. **Enable Google** authentication (optional)

### **Issue B: Invalid Firebase Configuration**
**Symptoms**: "auth/invalid-api-key" or initialization errors

**Current Config Check**:
- ✅ Project ID: `ai-interview-419f3`
- ✅ Auth Domain: `ai-interview-419f3.firebaseapp.com`
- ✅ API Key: `AIzaSyBdqor8ZCoWZXmgID4AwSkZMNt_U_MrnMQ`
- ✅ App ID: `1:14452059906:web:e86013feaba1515856dc1b`

### **Issue C: Backend API Connection**
**Symptoms**: Network errors, can't reach backend

**Check**:
- Backend running: ✅ Port 5000
- Frontend running: ✅ Port 5178
- CORS configured: ✅ Multiple ports allowed

### **Issue D: MongoDB Connection**
**Current Status**: ✅ Connected to Atlas (`ac-6jiwimw-shard-00-02.vkccwze.mongodb.net`)

## 🛠️ **Quick Fixes to Try**

### **Fix 1: Restart Both Servers**
```bash
# Kill existing processes
pkill -f "nodemon"
pkill -f "vite"

# Restart backend
cd /Users/madhusudanmahatha/Downloads/crisp/backend && npm run dev

# Restart frontend (new terminal)
cd /Users/madhusudanmahatha/Downloads/crisp && npm run dev
```

### **Fix 2: Enable Firebase Authentication**
1. Visit: https://console.firebase.google.com/project/ai-interview-419f3/authentication/providers
2. Click "Email/Password" → Enable → Save
3. Try login again

### **Fix 3: Test Simple Login**
Try these test credentials:
- **Email**: `test@example.com`
- **Password**: `password123`
- **Role**: Candidate

### **Fix 4: Check Network Tab**
1. Open browser Dev Tools → Network tab
2. Try to login
3. Look for failed requests (red entries)
4. Check if calls to `http://localhost:5000/api/auth/` are failing

## 🎯 **Most Likely Solution**

Based on typical Firebase setup issues, the problem is most likely:
**Firebase Authentication is not enabled in the console.**

To fix:
1. Go to https://console.firebase.google.com/project/ai-interview-419f3/authentication/providers
2. Enable "Email/Password" sign-in method
3. Refresh your app and try again

## 📞 **If Still Not Working**

Please share:
1. Any error messages from browser console
2. Any error messages from backend terminal
3. What exactly happens when you try to login (button doesn't work, error message, etc.)

This will help identify the exact issue! 🔍