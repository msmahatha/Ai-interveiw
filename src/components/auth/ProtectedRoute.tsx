import { ReactNode, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { RootState } from '@/store/store'
import Login from './Login'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: 'interviewer' | 'candidate'
  fallback?: ReactNode
}

export default function ProtectedRoute({ 
  children, 
  requiredRole, 
  fallback 
}: ProtectedRouteProps) {
  const { user, isAuthenticated, initialized, isLoading } = useSelector((state: RootState) => state.auth)
  const navigate = useNavigate()
  const location = useLocation()

  // Redirect authenticated users to appropriate page based on role
  useEffect(() => {
    if (isAuthenticated && user && initialized) {
      // If on root path, redirect based on user role
      if (location.pathname === '/') {
        const targetPath = user.role === 'interviewer' ? '/interviewer' : '/interviewee'
        navigate(targetPath, { replace: true })
      }
    }
  }, [isAuthenticated, user, initialized, location.pathname, navigate])

  // Show loading while initializing
  if (!initialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Show login if not authenticated
  if (!isAuthenticated || !user) {
    return fallback || <Login onSuccess={() => {
      // The auth state should automatically update through AuthProvider
      // No need to navigate here as useEffect above will handle it
      console.log('Login successful, auth state will update automatically')
    }} />
  }

  // Check role if required
  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
          <p className="text-sm text-gray-500 mt-2">Required: {requiredRole}, Your role: {user.role}</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}