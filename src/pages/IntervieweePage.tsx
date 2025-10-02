import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'

import { RootState } from '@/store/store'
import ResumeUpload from '@/components/interviewee/ResumeUpload'
import ChatInterface from '@/components/interviewee/ChatInterface'
import InterviewComplete from '@/components/interviewee/InterviewComplete'

export default function IntervieweePage() {
  const { candidateId, isComplete } = useSelector((state: RootState) => state.interview)
  const candidates = useSelector((state: RootState) => state.candidates.byId)
  const hasActiveInterview = candidateId && candidates[candidateId]

  // Debug logging
  console.log('IntervieweePage state:', { candidateId, isComplete, hasActiveInterview, candidatesCount: Object.keys(candidates).length })

  return (
    <div className="max-w-7xl mx-auto">
      <AnimatePresence mode="wait">
        {!hasActiveInterview && !isComplete && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <ResumeUpload />
          </motion.div>
        )}

        {hasActiveInterview && !isComplete && (
          <motion.div
            key="interview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
          >
            <ChatInterface />
          </motion.div>
        )}

        {isComplete && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <InterviewComplete />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}