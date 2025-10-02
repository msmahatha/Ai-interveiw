// Debug component to test Firebase configuration
import { useEffect, useState } from 'react';
import { auth } from '@/config/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export default function FirebaseDebug() {
  const [status, setStatus] = useState('Checking Firebase configuration...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkFirebase = async () => {
      try {
        // Check if Firebase is initialized
        if (!auth) {
          setError('Firebase auth not initialized');
          return;
        }

        setStatus('Firebase auth initialized successfully ✅');

        // Test environment variables
        console.log('Firebase Config:', {
          projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
          authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
          apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? 'Set ✅' : 'Missing ❌',
          appId: import.meta.env.VITE_FIREBASE_APP_ID ? 'Set ✅' : 'Missing ❌'
        });

        // Try to connect to Firebase (this will fail if API keys are wrong)
        auth.onAuthStateChanged((user) => {
          console.log('Auth state changed:', user ? 'User logged in' : 'No user');
        });

      } catch (err: any) {
        console.error('Firebase error:', err);
        setError(err.message);
      }
    };

    checkFirebase();
  }, []);

  const testSignUp = async () => {
    try {
      setStatus('Testing sign up...');
      const testEmail = 'test@example.com';
      const testPassword = 'test123456';
      
      const result = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
      setStatus('Sign up test successful! ✅');
      console.log('Test user created:', result.user);
    } catch (err: any) {
      console.error('Sign up test failed:', err);
      setError(`Sign up test failed: ${err.message}`);
    }
  };

  return (
    <div className="fixed top-4 right-4 bg-white p-4 border rounded-lg shadow-lg max-w-md z-50">
      <h3 className="font-bold mb-2">Firebase Debug</h3>
      <p className="text-sm mb-2">{status}</p>
      {error && (
        <p className="text-red-600 text-sm mb-2">{error}</p>
      )}
      <div className="space-y-2">
        <p className="text-xs">
          Project: {import.meta.env.VITE_FIREBASE_PROJECT_ID}
        </p>
        <p className="text-xs">
          API Key: {import.meta.env.VITE_FIREBASE_API_KEY ? 'Configured' : 'Missing'}
        </p>
        <button 
          onClick={testSignUp}
          className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
        >
          Test Sign Up
        </button>
      </div>
    </div>
  );
}