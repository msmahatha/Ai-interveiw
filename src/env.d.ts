/// <reference types="vite/client" />

interface ImportMetaEnv {
  // API Configuration
  readonly VITE_API_URL: string
  readonly VITE_GEMINI_API_KEY: string
  
  // Firebase Configuration
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
  
  // Feature Flags
  readonly VITE_ENABLE_PDF_EXPORT: string
  readonly VITE_ENABLE_REAL_TIME_NOTIFICATIONS: string
  readonly VITE_ENABLE_ANALYTICS: string
  
  // App Configuration
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}