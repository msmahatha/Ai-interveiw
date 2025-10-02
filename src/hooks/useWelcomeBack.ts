import { useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '@/store/store'
import { setWelcomeBackModalOpen } from '@/store/uiSlice'

/**
 * Hook to detect unfinished interviews and show welcome back modal
 */
export const useWelcomeBack = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { candidateId, isComplete, answers, questions } = useSelector((state: RootState) => state.interview)
  const { isWelcomeBackModalOpen } = useSelector((state: RootState) => state.ui)
  const candidate = useSelector((state: RootState) => candidateId ? state.candidates.byId[candidateId] : null)
  
  // Track if we've already checked this session to prevent repeated modals
  const hasCheckedSession = useRef(false)
  const sessionKey = useRef<string | null>(null)

  useEffect(() => {
    // Create a unique session key based on candidate and progress
    const currentSessionKey = candidateId ? `${candidateId}-${answers.length}-${questions.length}` : null
    
    // Check for unfinished interview session only once per app load
    const checkForUnfinishedSession = () => {
      // Don't show modal if already checked this session or if no active interview
      if (hasCheckedSession.current || isWelcomeBackModalOpen || !candidateId || !candidate) {
        return
      }

      // Don't show if interview is already completed
      if (isComplete) {
        hasCheckedSession.current = true
        return
      }

      // Check if there's actual progress (answers submitted)
      const hasProgress = answers.length > 0

      // Only show if there's real progress and this is a page reload scenario
      if (hasProgress && !sessionStorage.getItem('interview-session-active')) {
        // Mark that we've checked and show the modal
        hasCheckedSession.current = true
        sessionKey.current = currentSessionKey
        
        setTimeout(() => {
          dispatch(setWelcomeBackModalOpen(true))
        }, 500)
      } else {
        // Mark session as active for current tab
        sessionStorage.setItem('interview-session-active', 'true')
        hasCheckedSession.current = true
      }
    }

    // Only check if session key has changed (indicating new session or page reload)
    if (currentSessionKey !== sessionKey.current) {
      sessionKey.current = currentSessionKey
      hasCheckedSession.current = false
    }

    checkForUnfinishedSession()
  }, [candidateId, candidate, isComplete, answers.length, questions.length, isWelcomeBackModalOpen, dispatch])

  // Clean up session storage when component unmounts
  useEffect(() => {
    return () => {
      // Clear session flag when app closes
      sessionStorage.removeItem('interview-session-active')
    }
  }, [])

  return {
    hasUnfinishedSession: candidateId && candidate && !isComplete && (answers.length > 0 || questions.length > 0),
    candidateId,
    candidate,
    progress: answers.length,
    totalQuestions: questions.length
  }
}