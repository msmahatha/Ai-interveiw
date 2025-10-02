import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { formatTime } from '@/lib/utils'
import { useTimer } from '@/hooks/useTimer'
import { startQuestionTimer } from '@/store/interviewSlice'
import { AppDispatch } from '@/store/store'

interface QuestionTimerProps {
  duration: number
  onTimeUp: (timeTaken: number) => void
  isActive: boolean
  questionId: string
}

export default function QuestionTimer({ duration, onTimeUp, isActive, questionId }: QuestionTimerProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { timeLeft, progress, isWarning, estimatedEndTime } = useTimer({ duration, onTimeUp, isActive })

  // Start timer when question changes or becomes active
  useEffect(() => {
    if (isActive) {
      dispatch(startQuestionTimer())
    }
  }, [isActive, questionId, dispatch])
  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (progress / 100) * circumference

  const getColor = () => {
    if (isWarning) return '#ef4444' // red-500
    if (progress > 75) return '#f59e0b' // yellow-500
    return '#10b981' // green-500
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-4">Time Remaining</h3>
        
        <div className="relative w-32 h-32 mx-auto mb-4">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              stroke={getColor()}
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.5, ease: "linear" }}
            />
          </svg>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <motion.div
                className={`text-2xl font-bold ${
                  isWarning ? 'text-red-500 animate-pulse' : 'text-gray-700'
                }`}
                animate={isWarning ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.5, repeat: isWarning ? Infinity : 0 }}
              >
                {formatTime(timeLeft)}
              </motion.div>
              <div className="text-xs text-muted-foreground mt-1">
                remaining
              </div>
            </div>
          </div>
        </div>

        {isWarning && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-sm font-medium mb-2"
          >
            ⚠️ Time is running out!
          </motion.div>
        )}

        <div className="text-xs text-muted-foreground">
          Auto-submit when time expires
        </div>
        
        {estimatedEndTime && (
          <div className="text-xs text-muted-foreground mt-2 p-2 bg-gray-50 rounded">
            <div className="font-medium">Estimated completion:</div>
            <div>{estimatedEndTime}</div>
          </div>
        )}
      </div>
    </div>
  )
}