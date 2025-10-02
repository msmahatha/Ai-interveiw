import { useEffect, ReactNode } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { User as FirebaseUser } from 'firebase/auth'

import { RootState, AppDispatch } from '@/store/store'
import { setUser, setInitialized, setLoading } from '@/store/authSlice'
import authService from '@/services/authService'

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
          // User is signed in, get their profile from our backend
          try {
            const userProfile = await authService.getCurrentUserProfile()
            console.log('User profile retrieved:', userProfile)
            dispatch(setUser(userProfile))
          } catch (error) {
            console.error('Error getting user profile:', error)
            // If we can't get profile, user might be newly registered
            // The registration process should have already set the user in Redux
            console.warn('Failed to get user profile from backend, but user is authenticated in Firebase')
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