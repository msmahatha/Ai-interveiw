import { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { RootState, AppDispatch } from '@/store/store'
import { submitAnswer, nextQuestion, completeInterview } from '@/store/interviewSlice'
import { addAnswer, completeInterview as completeCandidate } from '@/store/candidatesSlice'
import { geminiService } from '@/services/geminiService'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft } from 'lucide-react'
import QuestionTimer from './QuestionTimer'
import ProgressCard from './ProgressCard'
import ChatMessage from './ChatMessage'

export default function ChatInterface() {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { candidateId, questions, currentQuestion, answers } = useSelector((state: RootState) => state.interview)
  const candidate = useSelector((state: RootState) => state.candidates.byId[candidateId || ''])
  
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const question = questions[currentQuestion]
  const previousAnswer = answers.find(a => a.questionId === question?.id)
  const timeLimit = question?.timeLimit || 60

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentQuestion, answers])

  // Handle answer submission
  const handleSubmit = async (timeTaken: number, isAutoSubmit = false) => {
    if (isSubmitting) return
    
    // For manual submit, require non-empty answer. For auto-submit, allow empty answers
    if (!isAutoSubmit && !currentAnswer.trim()) return

    setIsSubmitting(true)
    
    try {
      // Submit answer to interview state
      dispatch(submitAnswer({
        questionId: question.id,
        text: currentAnswer,
        timeTaken
      }))

      // Handle empty answers (from auto-submit) and validate poor answers
      let adjustedAnswer = currentAnswer.trim()
      if (adjustedAnswer.length === 0) {
        adjustedAnswer = isAutoSubmit ? 'No response provided (time expired)' : 'No response provided'
      } else if (adjustedAnswer.length < 5) {
        adjustedAnswer = 'Very brief response provided'
      }

      // Use Gemini AI for scoring (with fallback)
      const scoreResult = await geminiService.scoreAnswer(
        question.text,
        adjustedAnswer,
        question.difficulty,
        timeLimit,
        timeTaken
      )

      // Additional validation - cap scores for very short answers
      let finalScore = scoreResult.score
      if (currentAnswer.trim().length < 20 && finalScore > 40) {
        finalScore = Math.min(finalScore, 40) // Cap at 40 for very short answers
      }
      if (currentAnswer.trim().length < 10 && finalScore > 25) {
        finalScore = Math.min(finalScore, 25) // Cap at 25 for extremely short answers
      }

      // Add answer to candidate
      if (candidateId) {
        dispatch(addAnswer({
          candidateId,
          answer: {
            question: question.text,
            answer: currentAnswer,
            score: finalScore,
            timeTaken,
            timeAllowed: timeLimit,
            difficulty: question.difficulty
          }
        }))

        // Provide feedback based on score and answer quality
        if (currentAnswer.trim().length < 10) {
          toast.warning('Very brief answer - consider adding more detail for better evaluation', {
            duration: 3000
          })
        } else if (finalScore >= 80) {
          toast.success('Excellent answer! 🎉', { duration: 2000 })
        } else if (finalScore >= 60) {
          toast.success('Good response! ✅', { duration: 2000 })
        } else if (finalScore >= 40) {
          toast.info('Adequate answer, room for improvement', { duration: 2500 })
        } else {
          toast.warning('Consider providing more technical depth in your answers', { 
            duration: 3000 
          })
        }
      }

      setCurrentAnswer('')

      // Move to next question or complete interview
      if (currentQuestion < questions.length - 1) {
        dispatch(nextQuestion())
      } else {
        // Calculate final score and complete interview
        const allAnswers = answers.concat([{
          questionId: question.id,
          text: currentAnswer,
          timeTaken
        }])
        
        // Get all candidate answers with their individual scores from the store
        const existingAnswers = candidate?.answers || []
        
        // Add the current answer with its score
        const currentAnswerWithScore = {
          question: question.text,
          answer: currentAnswer,
          score: finalScore,
          timeTaken,
          timeAllowed: timeLimit,
          difficulty: question.difficulty
        }
        
        const allCandidateAnswers = [...existingAnswers, currentAnswerWithScore]
        
        // Calculate average score from all individual answer scores
        const realFinalScore = allCandidateAnswers.length > 0 
          ? allCandidateAnswers.reduce((sum, ans) => sum + ans.score, 0) / allCandidateAnswers.length
          : finalScore
        const summary = await generateSummary(allAnswers, Math.round(realFinalScore))

        if (candidateId) {
          dispatch(completeCandidate({
            id: candidateId,
            score: Math.round(realFinalScore),
            summary,
            answers: allCandidateAnswers
          }))
        }

        dispatch(completeInterview())
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkip = () => {
    if (isSubmitting) return
    
    dispatch(submitAnswer({
      questionId: question.id,
      text: '',
      timeTaken: 0
    }))

    if (currentQuestion < questions.length - 1) {
      dispatch(nextQuestion())
    } else {
      dispatch(completeInterview())
    }
  }

  const generateSummary = async (answers: any[], score: number): Promise<string> => {
    if (!candidate?.name) return 'Interview summary not available'
    
    return await geminiService.generateSummary(
      candidate.name,
      answers.map(a => ({
        question: questions.find(q => q.id === a.questionId)?.text || '',
        answer: a.text,
        score: Math.floor(Math.random() * 40) + 60,
        difficulty: questions.find(q => q.id === a.questionId)?.difficulty || 'medium',
        timeTaken: a.timeTaken
      })),
      score
    )
  }

  if (!question || !candidate) return null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
      {/* Chat Area */}
      <div className="lg:col-span-3 flex flex-col">
        <Card className="flex-1 flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/')}
                  className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </Button>
                <div>
                  <h2 className="text-lg font-semibold">Technical Interview</h2>
                  <p className="text-sm text-muted-foreground">
                    Question {currentQuestion + 1} of {questions.length} • {question.difficulty.toUpperCase()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Time limit:</span>
                <span className="font-mono text-lg font-semibold">
                  {Math.floor(timeLimit / 60)}:{(timeLimit % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Welcome message */}
            {currentQuestion === 0 && (
              <ChatMessage
                type="ai"
                content={`Hi ${candidate.name}! 👋 Welcome to your technical interview. I'll be asking you ${questions.length} questions to assess your skills as a Full Stack Developer. Let's start with your first question!`}
                timestamp={new Date()}
              />
            )}

            {/* Question */}
            <ChatMessage
              type="ai"
              content={question.text}
              timestamp={new Date()}
              isQuestion
              difficulty={question.difficulty}
            />

            {/* Previous answer if exists */}
            {previousAnswer && previousAnswer.text && (
              <ChatMessage
                type="user"
                content={previousAnswer.text}
                timestamp={new Date()}
              />
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t bg-gray-50">
            <div className="flex flex-col space-y-3">
              <Textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Type your answer here... (Ctrl+Enter to submit)"
                className="min-h-[100px] resize-none"
                disabled={isSubmitting}
                onKeyDown={(e) => {
                  if (e.ctrlKey && e.key === 'Enter') {
                    handleSubmit(timeLimit - 1, false)
                  }
                }}
              />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {currentAnswer.length} characters
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSkip}
                    disabled={isSubmitting}
                  >
                    Skip Question
                  </Button>
                  <Button
                    onClick={() => handleSubmit(timeLimit - 1, false)}
                    disabled={!currentAnswer.trim() || isSubmitting}
                    className="min-w-[120px]"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <QuestionTimer
          duration={timeLimit}
          onTimeUp={handleSubmit}
          isActive={!isSubmitting}
          questionId={question.id}
        />
        
        <ProgressCard
          currentQuestion={currentQuestion + 1}
          totalQuestions={questions.length}
          questions={questions}
        />
      </div>
    </div>
  )
}