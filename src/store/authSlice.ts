import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import authService, { User } from '@/services/authService'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  initialized: boolean
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  initialized: false,
}

// Async thunks
export const signUp = createAsyncThunk(
  'auth/signUp',
  async (userData: { email: string; password: string; name: string; role: 'interviewer' | 'candidate' }) => {
    const user = await authService.signUp(userData.email, userData.password, userData.name, userData.role)
    return user
  }
)

export const signIn = createAsyncThunk(
  'auth/signIn',
  async (credentials: { email: string; password: string }) => {
    const user = await authService.signIn(credentials.email, credentials.password)
    return user
  }
)

export const signInWithGoogle = createAsyncThunk(
  'auth/signInWithGoogle',
  async (role: 'interviewer' | 'candidate' = 'candidate') => {
    const user = await authService.signInWithGoogle(role)
    return user
  }
)

export const signOut = createAsyncThunk(
  'auth/signOut',
  async () => {
    await authService.signOut()
  }
)

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async () => {
    const user = await authService.getCurrentUserProfile()
    return user
  }
)

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (updates: Partial<User>) => {
    const user = await authService.updateProfile(updates)
    return user
  }
)

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (email: string) => {
    await authService.resetPassword(email)
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload
      state.isAuthenticated = !!action.payload
    },
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.initialized = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
  },
  extraReducers: (builder) => {
    // Sign up
    builder
      .addCase(signUp.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(signUp.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Sign up failed'
      })

    // Sign in
    builder
      .addCase(signIn.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(signIn.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Sign in failed'
      })

    // Sign in with Google
    builder
      .addCase(signInWithGoogle.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(signInWithGoogle.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(signInWithGoogle.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Google sign in failed'
      })

    // Sign out
    builder
      .addCase(signOut.pending, (state) => {
        state.isLoading = true
      })
      .addCase(signOut.fulfilled, (state) => {
        state.isLoading = false
        state.user = null
        state.isAuthenticated = false
        state.error = null
      })
      .addCase(signOut.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Sign out failed'
      })

    // Get current user
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false
        if (action.payload) {
          state.user = action.payload
          state.isAuthenticated = true
        }
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.isLoading = false
        state.user = null
        state.isAuthenticated = false
      })

    // Update profile
    builder
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        state.error = null
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Profile update failed'
      })

    // Reset password
    builder
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false
        state.error = null
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Password reset failed'
      })
  },
})

export const { clearError, setUser, setInitialized, setLoading } = authSlice.actions
export default authSlice.reducer