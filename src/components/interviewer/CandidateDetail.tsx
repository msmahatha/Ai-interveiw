import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mail, Phone, Award, 
  ChevronDown, ChevronUp, Download, X 
} from 'lucide-react'

import { Candidate } from '@/store/candidatesSlice'
import { CardContent, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getScoreColor, getDifficultyColor, generateInitials, formatTime } from '@/lib/utils'

interface CandidateDetailProps {
  candidate: Candidate
}

export default function CandidateDetail({ candidate }: CandidateDetailProps) {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set())

  const toggleQuestion = (questionId: string) => {
    const newExpanded = new Set(expandedQuestions)
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId)
    } else {
      newExpanded.add(questionId)
    }
    setExpandedQuestions(newExpanded)
  }

  const exportToPDF = () => {
    // In a real app, this would generate a PDF
    alert('PDF export functionality coming soon!')
  }

  const totalTime = candidate.answers.reduce((sum, answer) => sum + answer.timeTaken, 0)

  return (
    <div className="bg-white rounded-xl shadow-lg sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-xl">Candidate Details</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {/* Close detail view */}}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-4 mb-4">
          <Avatar className="w-16 h-16">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-xl">
              {generateInitials(candidate.name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{candidate.name}</h3>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Mail className="w-3 h-3 mr-2" />
                {candidate.email}
              </div>
              <div className="flex items-center">
                <Phone className="w-3 h-3 mr-2" />
                {candidate.phone}
              </div>
            </div>
          </div>

          <Badge className={getScoreColor(candidate.score) + ' text-lg px-3 py-1'}>
            {candidate.score}/100
          </Badge>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {candidate.answers.length}/6
            </div>
            <div className="text-xs text-muted-foreground">Questions</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {formatTime(totalTime)}
            </div>
            <div className="text-xs text-muted-foreground">Total Time</div>
          </div>
        </div>
      </div>

      <CardContent className="p-6">
        {/* Interview Summary */}
        <div className="mb-6">
          <h4 className="font-semibold mb-3 flex items-center">
            <Award className="w-4 h-4 mr-2" />
            AI Summary
          </h4>
          <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
            {candidate.summary}
          </p>
        </div>

        {/* Questions & Answers */}
        <div className="space-y-4">
          <h4 className="font-semibold mb-3">Interview Responses</h4>
          
          {candidate.answers.map((answer, index) => (
            <motion.div
              key={index}
              className="border rounded-lg overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleQuestion(`q${index}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge className={getDifficultyColor(answer.difficulty)}>
                      {answer.difficulty}
                    </Badge>
                    <span className="font-medium">Question {index + 1}</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Badge className={getScoreColor(answer.score)}>
                      {answer.score}/100
                    </Badge>
                    {expandedQuestions.has(`q${index}`) ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </div>
                
                <div className="mt-2 text-sm text-muted-foreground">
                  {answer.question.substring(0, 80)}...
                </div>
                
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <span>Time: {formatTime(answer.timeTaken)} / {formatTime(answer.timeAllowed)}</span>
                  <span>Efficiency: {Math.round((answer.timeTaken / answer.timeAllowed) * 100)}%</span>
                </div>
              </div>

              <AnimatePresence>
                {expandedQuestions.has(`q${index}`) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t bg-gray-50"
                  >
                    <div className="p-4 space-y-3">
                      <div>
                        <h5 className="font-medium text-sm mb-2">Question:</h5>
                        <p className="text-sm text-gray-700">{answer.question}</p>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-sm mb-2">Answer:</h5>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {answer.answer || 'No answer provided'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 space-y-3">
          <Button
            className="w-full"
            variant="outline"
            onClick={exportToPDF}
          >
            <Download className="w-4 h-4 mr-2" />
            Export as PDF
          </Button>
        </div>
      </CardContent>
    </div>
  )
}