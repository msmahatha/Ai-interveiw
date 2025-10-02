import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { LogOut, User, Settings, Plus } from 'lucide-react'

import { RootState, AppDispatch } from '@/store/store'
import { setActiveTab } from '@/store/uiSlice'
import { signOut } from '@/store/authSlice'
import InterviewService from '@/services/interviewService'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function Header() {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useSelector((state: RootState) => state.auth)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const tabs = [
    { id: 'interviewee', label: 'Interviewee', icon: '👤', path: '/' },
    { id: 'interviewer', label: 'Interviewer', icon: '📊', path: '/interviewer' },
  ]

  // Determine current active tab based on current path
  const getCurrentTab = () => {
    if (location.pathname === '/interviewer') return 'interviewer'
    return 'interviewee'
  }

  const currentTab = getCurrentTab()

  const handleNewInterview = async () => {
    // Reset interview state using the service
    await InterviewService.startNewInterview(dispatch)
    // Navigate to interviewee page (resume upload)
    navigate('/')
    dispatch(setActiveTab('interviewee'))
  }

  // Sync Redux state with current route
  useEffect(() => {
    dispatch(setActiveTab(currentTab))
  }, [currentTab, dispatch])

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu])

  return (
    <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Crisp
              </h1>
              <p className="text-xs text-muted-foreground">AI Interview Assistant</p>
            </div>
          </motion.div>

          <div className="flex items-center space-x-4">
            {/* New Interview Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleNewInterview}
              className="hidden sm:flex items-center space-x-2 border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              <Plus className="w-4 h-4" />
              <span>New Interview</span>
            </Button>

            <nav className="flex items-center space-x-1">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={currentTab === tab.id ? 'gradient' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    dispatch(setActiveTab(tab.id as 'interviewee' | 'interviewer'))
                    navigate(tab.path)
                  }}
                  className={cn(
                    'relative transition-all duration-200',
                    currentTab === tab.id && 'text-white'
                  )}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                  {currentTab === tab.id && (
                    <motion.div
                      className="absolute inset-0 gradient-primary rounded-md -z-10"
                      layoutId="activeTab"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Button>
              ))}
            </nav>

            {/* User Menu */}
            {user && (
              <div className="relative" ref={userMenuRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:block text-sm">{user.name}</span>
                </Button>

                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-50"
                  >
                    <div className="px-3 py-2 text-xs text-gray-500 border-b">
                      {user.email}
                      <div className="text-xs text-blue-600 capitalize">{user.role}</div>
                    </div>
                    
                    <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </button>
                    
                    <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2">
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </button>
                    
                    <div className="border-t">
                      <button 
                        onClick={() => {
                          dispatch(signOut())
                          setShowUserMenu(false)
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2 text-red-600"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}