import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import authService from '../../services/authService';

export const AuthDebugger: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('testpass123');
  const [name, setName] = useState('Test User');
  const [loading, setLoading] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const clearLogs = () => setLogs([]);

  const testBackendConnection = async () => {
    addLog('🔍 Testing backend connection...');
    try {
      const response = await fetch('https://ai-interview-backend-3wh5.onrender.com/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      addLog(`✅ Backend connection successful: ${JSON.stringify(data)}`);
    } catch (error) {
      addLog(`❌ Backend connection failed: ${error}`);
    }
  };

  const testAuthEndpoint = async () => {
    addLog('🔍 Testing auth endpoint...');
    try {
      const response = await fetch('https://ai-interview-backend-3wh5.onrender.com/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Test' }),
      });
      const data = await response.json();
      addLog(`✅ Auth endpoint response: ${JSON.stringify(data)}`);
    } catch (error) {
      addLog(`❌ Auth endpoint failed: ${error}`);
    }
  };

  const testFirebaseAuth = async () => {
    setLoading(true);
    addLog('🔥 Testing Firebase authentication...');
    
    try {
      // Try to sign up the user
      addLog(`📝 Attempting to sign up user: ${email}`);
      const user = await authService.signUp(email, password, name, 'candidate');
      addLog(`✅ Firebase + Backend signup successful: ${JSON.stringify(user)}`);
    } catch (error: any) {
      addLog(`❌ Signup failed: ${error.message}`);
      
      // If signup fails, try to sign in
      try {
        addLog(`🔑 Attempting to sign in user: ${email}`);
        const user = await authService.signIn(email, password);
        addLog(`✅ Firebase + Backend signin successful: ${JSON.stringify(user)}`);
      } catch (signinError: any) {
        addLog(`❌ Signin also failed: ${signinError.message}`);
      }
    }
    setLoading(false);
  };

  const testProfileEndpoint = async () => {
    addLog('👤 Testing profile endpoint...');
    try {
      const user = await authService.getCurrentUserProfile();
      if (user) {
        addLog(`✅ Profile retrieved: ${JSON.stringify(user)}`);
      } else {
        addLog(`❌ No user profile found`);
      }
    } catch (error: any) {
      addLog(`❌ Profile request failed: ${error.message}`);
    }
  };

  return (
    <Card className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Authentication Debugger</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">Test Controls</h3>
          
          <div className="space-y-3 mb-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Button onClick={testBackendConnection} className="w-full">
              Test Backend Connection
            </Button>
            <Button onClick={testAuthEndpoint} className="w-full">
              Test Auth Endpoint
            </Button>
            <Button 
              onClick={testFirebaseAuth} 
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Testing...' : 'Test Firebase + Backend Auth'}
            </Button>
            <Button onClick={testProfileEndpoint} className="w-full">
              Test Profile Endpoint
            </Button>
            <Button onClick={clearLogs} variant="outline" className="w-full">
              Clear Logs
            </Button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Debug Logs</h3>
          <div className="bg-gray-100 p-4 rounded-lg h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet. Run a test to see results.</p>
            ) : (
              <div className="space-y-1">
                {logs.map((log, index) => (
                  <div key={index} className="text-sm font-mono">
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-800">Current Configuration:</h4>
        <p className="text-sm text-blue-700 mt-1">
          API Base URL: {import.meta.env.VITE_API_URL || 'Not configured'}
        </p>
        <p className="text-sm text-blue-700">
          Firebase Project: {import.meta.env.VITE_FIREBASE_PROJECT_ID || 'Not configured'}
        </p>
      </div>
    </Card>
  );
};

export default AuthDebugger;