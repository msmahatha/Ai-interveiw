import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Star, Clock, Award, ArrowLeft } from 'lucide-react'

import { RootState, AppDispatch } from '@/store/store'
import InterviewService from '@/services/interviewService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatTime } from '@/lib/utils'

export default function InterviewComplete() {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { candidateId } = useSelector((state: RootState) => state.interview)
  const candidate = useSelector((state: RootState) => state.candidates.byId[candidateId || ''])

  const handleStartNewInterview = async () => {
    // Use the interview service to start a new interview
    await InterviewService.startNewInterview(dispatch)
    // Navigate to the interviewee page (which will show the resume upload)
    navigate('/interviewee')
  }

  if (!candidate) return null

  const totalTime = candidate.answers.reduce((sum, answer) => sum + answer.timeTaken, 0)
  const avgScore = candidate.answers.reduce((sum, answer) => sum + answer.score, 0) / candidate.answers.length

  const getScoreMessage = (score: number) => {
    if (score >= 80) return { message: 'Excellent!', color: 'text-green-600' }
    if (score >= 60) return { message: 'Good Job!', color: 'text-blue-600' }
    if (score >= 40) return { message: 'Not Bad!', color: 'text-yellow-600' }
    return { message: 'Keep Learning!', color: 'text-red-600' }
  }

  const scoreInfo = getScoreMessage(candidate.score)

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
      >
        <Card className="text-center">
          <CardHeader>
            <motion.div
              className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full mx-auto mb-4 flex items-center justify-center"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, ease: "easeInOut" }}
            >
              <CheckCircle className="w-10 h-10 text-white" />
            </motion.div>
            
            <CardTitle className="text-3xl mb-2">Interview Complete! 🎉</CardTitle>
            <CardDescription className="text-lg">
              Congratulations {candidate.name}, you've successfully completed your technical interview
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Score Display */}
            <motion.div
              className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="text-6xl font-bold mb-2">
                <motion.span
                  className={scoreInfo.color}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                >
                  {candidate.score}
                </motion.span>
                <span className="text-4xl text-muted-foreground">/100</span>
              </div>
              <div className={`text-2xl font-semibold mb-4 ${scoreInfo.color}`}>
                {scoreInfo.message}
              </div>
              
              <div className="flex justify-center mb-4">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-6 h-6 ${
                        i < Math.floor(candidate.score / 20)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                className="bg-white rounded-xl p-6 border border-gray-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <span className="text-sm text-muted-foreground">Total Time</span>
                </div>
                <div className="text-2xl font-bold">{formatTime(totalTime)}</div>
              </motion.div>

              <motion.div
                className="bg-white rounded-xl p-6 border border-gray-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <Award className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-muted-foreground">Avg Score</span>
                </div>
                <div className="text-2xl font-bold">{Math.round(avgScore)}/100</div>
              </motion.div>

              <motion.div
                className="bg-white rounded-xl p-6 border border-gray-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="w-5 h-5 text-purple-500" />
                  <span className="text-sm text-muted-foreground">Questions</span>
                </div>
                <div className="text-2xl font-bold">{candidate.answers.length}/6</div>
              </motion.div>
            </div>

            {/* Summary */}
            <motion.div
              className="bg-gray-50 rounded-xl p-6 text-left"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Star className="w-5 h-5 text-yellow-500 mr-2" />
                AI Summary
              </h3>
              <p className="text-gray-700 leading-relaxed">{candidate.summary}</p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
            >
              <Button
                variant="gradient"
                size="lg"
                onClick={handleStartNewInterview}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
              >
                🚀 Start New Interview
              </Button>
              <Button
                variant="default"
                size="lg"
                onClick={() => navigate('/interviewer')}
              >
                View Dashboard
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}