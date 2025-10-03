import { useEffect, ReactNode } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { User as FirebaseUser } from 'firebase/auth'

import { RootState, AppDispatch } from '@/store/store'
import { setUser, setInitialized, setLoading } from '@/store/authSlice'
import authService from '@/services/authService'
import api from '@/services/api'

interface AuthProviderProps {
  children: ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { initialized } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    const initAuth = async () => {
      dispatch(setLoading(true))

      // Listen to Firebase auth state changes
      unsubscribe = authService.onAuthStateChange(async (firebaseUser: FirebaseUser | null) => {
        console.log('Auth state changed:', firebaseUser ? 'User logged in' : 'User logged out')
        
        if (firebaseUser) {
          // User is signed in, try to get their profile from our backend
          try {
            const userProfile = await authService.getCurrentUserProfile()
            console.log('User profile retrieved:', userProfile)
            dispatch(setUser(userProfile))
          } catch (error: any) {
            console.error('Error getting user profile:', error)
            
            // If we get a 401, the user exists in Firebase but not in our backend database
            if (error.response?.status === 401) {
              console.log('User not found in backend database, attempting to register...')
              try {
                // Wait a moment to ensure Firebase token is available
                await new Promise(resolve => setTimeout(resolve, 100))
                
                // Try to register the user using api service (which properly handles token in headers)
                const response = await api.post('/auth/register', {
                  name: firebaseUser.displayName || firebaseUser.email || 'User',
                  role: 'candidate', // Default role
                })
                console.log('User successfully registered in backend:', response.data.data.user)
                dispatch(setUser(response.data.data.user))
              } catch (registerError) {
                console.error('Registration error:', registerError)
                console.warn('Failed to register user in backend, but user is authenticated in Firebase')
              }
            } else {
              console.warn('Failed to get user profile from backend, but user is authenticated in Firebase')
            }
          }
        } else {
          // User is signed out
          console.log('User signed out, clearing state')
          dispatch(setUser(null))
        }

        if (!initialized) {
          dispatch(setInitialized(true))
        }
        dispatch(setLoading(false))
      })
    }

    initAuth()

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [dispatch, initialized])

  return <>{children}</>
}