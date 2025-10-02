import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { PlayCircle, RotateCcw, X } from 'lucide-react'

import { AppDispatch, RootState } from '@/store/store'
import { setWelcomeBackModalOpen } from '@/store/uiSlice'
import { resumeInterview, resetInterview } from '@/store/interviewSlice'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function WelcomeBackModal() {
  const dispatch = useDispatch<AppDispatch>()
  const { currentQuestion, questions, candidateId } = useSelector((state: RootState) => state.interview)
  const candidate = useSelector((state: RootState) => state.candidates.byId[candidateId || ''])

  const handleResume = () => {
    // Mark session as active to prevent modal from showing again
    sessionStorage.setItem('interview-session-active', 'true')
    dispatch(resumeInterview())
    dispatch(setWelcomeBackModalOpen(false))
  }

  const handleStartFresh = () => {
    // Clear session storage and mark as active
    sessionStorage.removeItem('interview-session-active')
    sessionStorage.setItem('interview-session-active', 'true')
    dispatch(resetInterview())
    dispatch(setWelcomeBackModalOpen(false))
    // In a real app, this would also reset the candidate data
  }

  if (!candidate) return null

  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", damping: 25 }}
        className="w-full max-w-md"
      >
        <Card className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2"
            onClick={() => {
              sessionStorage.setItem('interview-session-active', 'true')
              dispatch(setWelcomeBackModalOpen(false))
            }}
          >
            <X className="w-4 h-4" />
          </Button>

          <CardHeader className="text-center">
            <motion.div
              className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <span className="text-2xl">👋</span>
            </motion.div>
            
            <CardTitle className="text-xl">Welcome Back!</CardTitle>
            <p className="text-muted-foreground">
              Ready to continue your interview, {candidate.name}?
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Progress Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-center mb-3">
                <div className="text-2xl font-bold text-blue-600">
                  Question {currentQuestion + 1} of {questions.length}
                </div>
                <p className="text-sm text-muted-foreground">
                  {Math.round(progress)}% Complete
                </p>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                className="w-full"
                variant="gradient"
                size="lg"
                onClick={handleResume}
              >
                <PlayCircle className="w-5 h-5 mr-2" />
                Resume Interview
              </Button>
              
              <Button
                className="w-full"
                variant="outline"
                onClick={handleStartFresh}
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Start Fresh
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Your previous answers have been saved. Choose "Resume" to continue or "Start Fresh" to begin a new interview.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}