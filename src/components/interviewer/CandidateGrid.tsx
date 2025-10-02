import { useDispatch } from 'react-redux'
import { motion } from 'framer-motion'

import { AppDispatch } from '@/store/store'
import { setSelectedCandidateId } from '@/store/uiSlice'
import { Candidate } from '@/store/candidatesSlice'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { generateInitials, getScoreColor } from '@/lib/utils'

interface CandidateGridProps {
  candidates: Candidate[]
}

export default function CandidateGrid({ candidates }: CandidateGridProps) {
  const dispatch = useDispatch<AppDispatch>()

  const handleSelectCandidate = (candidateId: string) => {
    dispatch(setSelectedCandidateId(candidateId))
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {candidates.map((candidate, index) => (
        <motion.div
          key={candidate.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -5 }}
        >
          <Card
            className="cursor-pointer transition-all hover:shadow-lg border-2 hover:border-blue-200"
            onClick={() => handleSelectCandidate(candidate.id)}
          >
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600">
                    {generateInitials(candidate.name)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold truncate">{candidate.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{candidate.email}</p>
                </div>

                <Badge className={getScoreColor(candidate.score)}>
                  {candidate.score}/100
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge
                    variant={candidate.status === 'completed' ? 'default' : 'secondary'}
                  >
                    {candidate.status === 'completed' ? 'Completed' : 'In Progress'}
                  </Badge>
                </div>

                {/* Interview Date */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Date</span>
                  <span className="text-sm">
                    {new Date(candidate.interviewDate).toLocaleDateString()}
                  </span>
                </div>

                {/* Questions Answered */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Questions</span>
                  <span className="text-sm font-medium">
                    {candidate.answers.length}/6
                  </span>
                </div>

                {/* Average Score */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg Score</span>
                  <span className="text-sm font-medium">
                    {candidate.answers.length > 0
                      ? Math.round(
                          candidate.answers.reduce((sum, a) => sum + a.score, 0) /
                            candidate.answers.length
                        )
                      : 0}/100
                  </span>
                </div>

                {/* Action Button */}
                <Button
                  className="w-full mt-4"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSelectCandidate(candidate.id)
                  }}
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}