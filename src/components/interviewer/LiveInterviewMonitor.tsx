import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { 
  Monitor, 
  MessageSquare, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Volume2,
  VolumeX
} from 'lucide-react'

import { RootState } from '@/store/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '../ui/progress'
import { getScoreColor, generateInitials, formatTime } from '@/lib/utils'

interface LiveInterviewMonitorProps {
  candidateId?: string
}

export default function LiveInterviewMonitor({ candidateId }: LiveInterviewMonitorProps) {
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  
  const interview = useSelector((state: RootState) => state.interview)
  const candidates = useSelector((state: RootState) => state.candidates.byId)
  
  const activeCandidate = candidateId ? candidates[candidateId] : 
    interview.candidateId ? candidates[interview.candidateId] : null

  // Simulated real-time data - in production, this would come from WebSocket or polling
  useEffect(() => {
    if (isMonitoring) {
      const interval = setInterval(() => {
        setCurrentTime(prev => prev + 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [isMonitoring])

  if (!activeCandidate) {
    return (
      <Card className="h-[600px] flex items-center justify-center">
        <CardContent className="text-center">
          <Monitor className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Active Interview</h3>
          <p className="text-muted-foreground">
            Select a candidate to monitor their interview session
          </p>
        </CardContent>
      </Card>
    )
  }

  const currentQuestion = interview.currentQuestion
  const totalQuestions = interview.questions.length
  const progress = totalQuestions > 0 ? ((currentQuestion + 1) / totalQuestions) * 100 : 0
  const isInterviewActive = interview.candidateId && !interview.isComplete

  return (
    <div className="space-y-6">
      {/* Monitor Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600">
                    {generateInitials(activeCandidate.name)}
                  </AvatarFallback>
                </Avatar>
                {isInterviewActive && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse border-2 border-white" />
                )}
              </div>
              
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <span>{activeCandidate.name}</span>
                  {isInterviewActive && (
                    <Badge variant="default" className="bg-green-500">
                      LIVE
                    </Badge>
                  )}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {activeCandidate.email} • Interview Session
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </Button>
              
              <Button
                variant={isMonitoring ? "secondary" : "default"}
                size="sm"
                onClick={() => setIsMonitoring(!isMonitoring)}
              >
                {isMonitoring ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Stop Monitoring
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Start Monitoring
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interview Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Interview Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overall Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">
                  {currentQuestion + 1} of {totalQuestions} questions
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Current Question */}
            {isInterviewActive && interview.questions[currentQuestion] && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-800">Current Question</span>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                    {interview.questions[currentQuestion].difficulty}
                  </Badge>
                </div>
                <p className="text-sm text-blue-700 mb-3">
                  {interview.questions[currentQuestion].text}
                </p>
                <div className="flex items-center justify-between text-xs text-blue-600">
                  <span>Time Limit: {interview.questions[currentQuestion].timeLimit}s</span>
                  <span>Category: {interview.questions[currentQuestion].category}</span>
                </div>
              </div>
            )}

            {/* Time Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-700">
                  {formatTime(currentTime)}
                </div>
                <div className="text-xs text-gray-500">Total Time</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-700">
                  {Math.round(activeCandidate.score) || 0}
                </div>
                <div className="text-xs text-gray-500">Current Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Monitor className="w-5 h-5" />
              <span>Live Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {isMonitoring ? (
                <>
                  {/* Simulated live events */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-green-800">
                        Answer submitted
                      </div>
                      <div className="text-xs text-green-600">
                        Question 2 • {formatTime(currentTime - 45)} ago
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg"
                  >
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-blue-800">
                        Started typing answer
                      </div>
                      <div className="text-xs text-blue-600">
                        Question 3 • {formatTime(currentTime - 12)} ago
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                  >
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-yellow-800">
                        Time warning triggered
                      </div>
                      <div className="text-xs text-yellow-600">
                        Question 3 • 30s remaining
                      </div>
                    </div>
                  </motion.div>
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Eye className="w-8 h-8 mx-auto mb-2" />
                  <p>Start monitoring to see live activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Answer History */}
      {activeCandidate.answers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Answer History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeCandidate.answers.map((answer, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Question {index + 1}</span>
                      <Badge variant="outline">{answer.difficulty}</Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getScoreColor(answer.score)}>
                        {answer.score}/100
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatTime(answer.timeTaken)}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {answer.question}
                  </p>
                  <p className="text-sm">
                    {answer.answer.length > 100 
                      ? `${answer.answer.substring(0, 100)}...` 
                      : answer.answer || 'No answer provided'
                    }
                  </p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}