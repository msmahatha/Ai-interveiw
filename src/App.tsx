import { Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'

import { RootState } from './store/store'
import Header from './components/layout/Header'
import WelcomeBackModal from './components/shared/WelcomeBackModal'
import AuthProvider from './components/auth/AuthProvider'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { useWelcomeBack } from './hooks/useWelcomeBack'

function App() {
  const { isWelcomeBackModalOpen } = useSelector((state: RootState) => state.ui)
  
  // Initialize welcome back detection
  useWelcomeBack()

  return (
    <AuthProvider>
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Outlet />
            </motion.div>
          </main>
          
          {isWelcomeBackModalOpen && <WelcomeBackModal />}
        </div>
      </ProtectedRoute>
    </AuthProvider>
  )
}

export default App