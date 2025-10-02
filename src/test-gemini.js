// Simple test script to verify Gemini API connection
// Run this in the browser console or as a separate test

import { testGeminiConnection, isGeminiConfigured } from './services/geminiService.js'

async function runGeminiTest() {
  console.log('🧪 Starting Gemini API Test...')
  
  console.log('1. Checking configuration...')
  const configured = isGeminiConfigured()
  console.log(`Configuration status: ${configured}`)
  
  if (configured) {
    console.log('2. Testing connection...')
    try {
      const success = await testGeminiConnection()
      console.log(`Connection test result: ${success}`)
      
      if (success) {
        console.log('✅ Gemini AI is working properly!')
      } else {
        console.log('❌ Gemini AI connection failed')
      }
    } catch (error) {
      console.error('❌ Test error:', error)
    }
  } else {
    console.log('❌ Gemini not configured - check .env file')
  }
}

// Export for manual testing
window.testGemini = runGeminiTest

console.log('🔧 Gemini test script loaded. Run window.testGemini() to test the API connection.')