import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Circle } from 'lucide-react'
import { getDifficultyColor, cn } from '@/lib/utils'

interface ProgressCardProps {
  currentQuestion: number
  totalQuestions: number
  questions: Array<{
    id: string
    difficulty: 'easy' | 'medium' | 'hard'
  }>
}

export default function ProgressCard({ currentQuestion, totalQuestions, questions }: ProgressCardProps) {
  const completedQuestions = currentQuestion - 1
  const progress = (completedQuestions / totalQuestions) * 100

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Interview Progress</h3>
        <div className="text-3xl font-bold text-blue-600">
          {currentQuestion}/{totalQuestions}
        </div>
        <p className="text-sm text-muted-foreground">Questions completed</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="text-xs text-muted-foreground mt-2 text-center">
          {Math.round(progress)}% Complete
        </div>
      </div>

      {/* Question List */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground mb-3">Questions</h4>
        {questions.map((question, index) => {
          const isCompleted = index < completedQuestions
          const isCurrent = index === completedQuestions
          const questionNumber = index + 1

          return (
            <motion.div
              key={question.id}
              className={cn(
                "flex items-center space-x-3 p-2 rounded-lg transition-colors",
                isCurrent && "bg-blue-50 border border-blue-200"
              )}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex-shrink-0">
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <Circle className={cn(
                    "w-5 h-5",
                    isCurrent ? "text-blue-500" : "text-gray-300"
                  )} />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  Question {questionNumber}
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className={getDifficultyColor(question.difficulty)}>
                    {question.difficulty}
                  </Badge>
                  {isCurrent && (
                    <span className="text-xs text-blue-600 font-medium">
                      Current
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-green-600">
              {completedQuestions}
            </div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-orange-600">
              {totalQuestions - completedQuestions}
            </div>
            <div className="text-xs text-muted-foreground">Remaining</div>
          </div>
        </div>
      </div>
    </div>
  )
}