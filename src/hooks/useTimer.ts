import { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '@/store/store'
import { updateTimeSpent, pauseTimer } from '@/store/interviewSlice'

interface UseTimerProps {
  duration: number
  onTimeUp: (timeTaken: number, isAutoSubmit?: boolean) => void
  isActive: boolean
}

export const useTimer = ({ duration, onTimeUp, isActive }: UseTimerProps) => {
  const dispatch = useDispatch<AppDispatch>()
  const { currentQuestionStartTime, timeSpentOnCurrentQuestion } = useSelector((state: RootState) => state.interview)
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastUpdateTimeRef = useRef<number | null>(null)
  


  
  const [timeLeft, setTimeLeft] = useState(duration)
  const [isWarning, setIsWarning] = useState(false)

  // Single effect to manage the entire timer logic
  useEffect(() => {
    // Calculate initial remaining time
    const calculateTimeLeft = () => {
      if (!currentQuestionStartTime) {
        return Math.max(0, duration - timeSpentOnCurrentQuestion)
      }
      
      const now = Date.now()
      const startTime = new Date(currentQuestionStartTime).getTime()
      const elapsedSinceStart = Math.max(0, Math.floor((now - startTime) / 1000))
      const totalElapsed = timeSpentOnCurrentQuestion + elapsedSinceStart
      return Math.max(0, duration - totalElapsed)
    }

    // Set initial time left
    const initialTimeLeft = calculateTimeLeft()
    setTimeLeft(initialTimeLeft)
    setIsWarning(initialTimeLeft <= 5)

    // If timer is not active, just pause and return
    if (!isActive) {
      if (currentQuestionStartTime) {
        dispatch(pauseTimer())
      }
      return
    }

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // Timer update function
    const updateTimer = () => {
      const remaining = calculateTimeLeft()
      setTimeLeft(remaining)
      
      if (remaining <= 5 && remaining > 0) {
        setIsWarning(true)
      }

      // Update Redux state every 10 seconds to reduce re-renders
      const now = Date.now()
      if (!lastUpdateTimeRef.current || now - lastUpdateTimeRef.current >= 10000) {
        const totalSpent = duration - remaining
        dispatch(updateTimeSpent(totalSpent))
        lastUpdateTimeRef.current = now
      }

      // Handle timer expiry
      if (remaining <= 0) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
        const finalSpent = duration
        dispatch(updateTimeSpent(finalSpent))
        onTimeUp(finalSpent, true)
      }
    }

    // Start the timer interval
    intervalRef.current = setInterval(updateTimer, 1000)

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [duration, isActive, currentQuestionStartTime, dispatch, onTimeUp]) // Minimal, stable dependencies

  // Calculate derived values
  const progress = ((duration - timeLeft) / duration) * 100
  const totalTimeSpent = duration - timeLeft

  return {
    timeLeft,
    progress,
    isWarning,
    totalTimeSpent,
    endTime: null, // Simplified - no longer tracking end time
    estimatedEndTime: null // Simplified - no longer providing estimates
  }
}