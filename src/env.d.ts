/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_ENABLE_PDF_EXPORT: string
  readonly VITE_ENABLE_REAL_TIME_NOTIFICATIONS: string
  readonly VITE_ENABLE_ANALYTICS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}