import { motion } from 'framer-motion'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { getDifficultyColor, cn } from '@/lib/utils'

interface ChatMessageProps {
  type: 'ai' | 'user'
  content: string
  timestamp: Date
  isQuestion?: boolean
  difficulty?: 'easy' | 'medium' | 'hard'
}

export default function ChatMessage({ 
  type, 
  content, 
  timestamp, 
  isQuestion = false, 
  difficulty = 'medium' 
}: ChatMessageProps) {
  const isAI = type === 'ai'
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-start space-x-3 ${isAI ? 'justify-start' : 'justify-end'}`}
    >
      {isAI && (
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-xs">
            AI
          </AvatarFallback>
        </Avatar>
      )}

      <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${isAI ? 'order-2' : 'order-1'}`}>
        <div
          className={cn(
            'rounded-2xl px-4 py-3 shadow-sm',
            isAI 
              ? 'bg-white border border-gray-200' 
              : 'gradient-primary text-white'
          )}
        >
          {isQuestion && (
            <div className="flex items-center space-x-2 mb-2">
              <Badge className={getDifficultyColor(difficulty)}>
                {difficulty.toUpperCase()}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Question
              </span>
            </div>
          )}
          
          <p className="text-sm leading-relaxed">{content}</p>
        </div>
        
        <div className={`flex items-center mt-1 text-xs text-muted-foreground ${isAI ? 'justify-start' : 'justify-end'}`}>
          <span>{timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {!isAI && (
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-gradient-to-br from-green-500 to-teal-600 text-xs">
            You
          </AvatarFallback>
        </Avatar>
      )}
    </motion.div>
  )
}