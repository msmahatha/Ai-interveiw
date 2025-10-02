import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';

let firebaseApp: admin.app.App | null = null;

export const initializeFirebase = async (): Promise<admin.app.App> => {
  try {
    if (firebaseApp) {
      return firebaseApp;
    }

    // Try to load service account from file first, then fallback to environment variables
    let serviceAccount: ServiceAccount;
    
    try {
      // Try to load from service account file
      const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './firebase-service-account.json';
      const fs = await import('fs');
      const path = await import('path');
      
      const fullPath = path.resolve(serviceAccountPath);
      if (fs.existsSync(fullPath)) {
        const serviceAccountKey = fs.readFileSync(fullPath, 'utf8');
        serviceAccount = JSON.parse(serviceAccountKey);
        console.log('📄 Using Firebase service account file');
      } else {
        throw new Error('Service account file not found');
      }
    } catch (fileError) {
      // Fallback to environment variables
      if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
        serviceAccount = {
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        } as ServiceAccount;
        console.log('🔧 Using Firebase environment variables');
      } else {
        throw new Error('Firebase configuration not found. Please provide service account file or environment variables.');
      }
    }

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.projectId,
    });

    console.log('🔥 Firebase Admin initialized successfully');
    return firebaseApp;
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error);
    throw error;
  }
};

export const getFirebaseApp = (): admin.app.App => {
  if (!firebaseApp) {
    throw new Error('Firebase not initialized. Call initializeFirebase() first.');
  }
  return firebaseApp;
};

export const verifyFirebaseToken = async (token: string): Promise<admin.auth.DecodedIdToken> => {
  try {
    const app = getFirebaseApp();
    const decodedToken = await app.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const createCustomToken = async (uid: string): Promise<string> => {
  try {
    const app = getFirebaseApp();
    const customToken = await app.auth().createCustomToken(uid);
    return customToken;
  } catch (error) {
    throw new Error('Failed to create custom token');
  }
};