import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { auth } from '../config/firebase';
import api from './api';

export interface User {
  uid: string;
  email: string;
  name: string;
  role: 'interviewer' | 'candidate';
  profilePicture?: string;
  createdAt: string;
}

class AuthService {
  // Sign up with email and password
  async signUp(email: string, password: string, name: string, role: 'interviewer' | 'candidate' = 'candidate'): Promise<User> {
    try {
      // Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Update display name
      await updateProfile(firebaseUser, { displayName: name });

      // Get Firebase token
      const firebaseToken = await firebaseUser.getIdToken();

      // Register user in our backend
      const response = await api.post('/auth/register', {
        firebaseToken,
        name,
        role,
      });

      return response.data.data.user;
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Sign up failed');
    }
  }

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Get Firebase token
      const firebaseToken = await firebaseUser.getIdToken();

      try {
        // First try to verify with our backend
        const response = await api.post('/auth/verify', {
          firebaseToken,
        });
        return response.data.data.user;
      } catch (verifyError: any) {
        // If verify fails (user not in our database), try to register them
        if (verifyError.response?.status === 404) {
          console.log('User not found in backend, registering...');
          const registerResponse = await api.post('/auth/register', {
            firebaseToken,
            name: firebaseUser.displayName || firebaseUser.email || 'User',
            role: 'candidate', // Default role for sign-in users
          });
          return registerResponse.data.data.user;
        }
        throw verifyError;
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Sign in failed');
    }
  }

  // Sign in with Google
  async signInWithGoogle(role: 'interviewer' | 'candidate' = 'candidate'): Promise<User> {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;

      // Get Firebase token
      const firebaseToken = await firebaseUser.getIdToken();

      // Register/login user in our backend
      const response = await api.post('/auth/register', {
        firebaseToken,
        name: firebaseUser.displayName || 'User',
        role,
      });

      return response.data.data.user;
    } catch (error: any) {
      console.error('Google sign in error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Google sign in failed');
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      // Call backend logout (optional)
      try {
        await api.post('/auth/logout');
      } catch (error) {
        // Ignore backend logout errors
        console.warn('Backend logout failed:', error);
      }

      // Sign out from Firebase
      await signOut(auth);
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error(error.message || 'Sign out failed');
    }
  }

  // Get current user profile
  async getCurrentUserProfile(): Promise<User | null> {
    try {
      const response = await api.get('/auth/profile');
      return response.data.data.user;
    } catch (error) {
      console.error('Get profile error:', error);
      return null;
    }
  }

  // Update user profile
  async updateProfile(updates: Partial<User>): Promise<User> {
    try {
      const response = await api.put('/auth/profile', updates);
      return response.data.data.user;
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Profile update failed');
    }
  }

  // Reset password
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Reset password error:', error);
      throw new Error(error.message || 'Password reset failed');
    }
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (user: FirebaseUser | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }

  // Get current Firebase user
  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  // Get current user token
  async getCurrentUserToken(): Promise<string | null> {
    try {
      const user = auth.currentUser;
      if (user) {
        return await user.getIdToken();
      }
      return null;
    } catch (error) {
      console.error('Get token error:', error);
      return null;
    }
  }
}

export const authService = new AuthService();
export default authService;