import { useState, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  Award,
  Target,
  Calendar,
  Download,
  ChevronRight
} from 'lucide-react'

import { RootState } from '@/store/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '../ui/progress'
import { formatTime } from '@/lib/utils'



export default function InterviewAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('week')
  const candidates = useSelector((state: RootState) => state.candidates)

  const analyticsData = useMemo(() => {
    const allCandidates = candidates.allIds.map(id => candidates.byId[id])
    const completedCandidates = allCandidates.filter(c => c.status === 'completed')
    
    // Calculate analytics
    const totalCandidates = allCandidates.length
    const completedInterviews = completedCandidates.length
    const avgScore = completedCandidates.length > 0 
      ? Math.round(completedCandidates.reduce((sum, c) => sum + c.score, 0) / completedCandidates.length)
      : 0

    // Calculate average interview time
    const totalTime = completedCandidates.reduce((sum, candidate) => {
      return sum + candidate.answers.reduce((answerSum, answer) => answerSum + answer.timeTaken, 0)
    }, 0)
    const avgInterviewTime = completedCandidates.length > 0 ? totalTime / completedCandidates.length : 0

    // Calculate pass rate (assuming 70+ is passing)
    const passRate = completedCandidates.length > 0 
      ? (completedCandidates.filter(c => c.score >= 70).length / completedCandidates.length) * 100
      : 0

    // Top performers
    const topPerformers = [...completedCandidates]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)

    // Score distribution
    const scoreRanges = [
      { range: '90-100', min: 90, max: 100 },
      { range: '80-89', min: 80, max: 89 },
      { range: '70-79', min: 70, max: 79 },
      { range: '60-69', min: 60, max: 69 },
      { range: '0-59', min: 0, max: 59 }
    ]
    
    const scoreDistribution = scoreRanges.map(range => {
      const count = completedCandidates.filter(c => c.score >= range.min && c.score <= range.max).length
      const percentage = completedCandidates.length > 0 ? (count / completedCandidates.length) * 100 : 0
      return { range: range.range, count, percentage: Math.round(percentage) }
    })

    // Mock weekly trends (in production, this would come from real data)
    const weeklyTrends = [
      { day: 'Mon', interviews: 3, avgScore: 75 },
      { day: 'Tue', interviews: 5, avgScore: 82 },
      { day: 'Wed', interviews: 4, avgScore: 78 },
      { day: 'Thu', interviews: 6, avgScore: 85 },
      { day: 'Fri', interviews: 2, avgScore: 70 },
      { day: 'Sat', interviews: 1, avgScore: 90 },
      { day: 'Sun', interviews: 0, avgScore: 0 }
    ]

    // Difficulty breakdown
    const difficulties = ['easy', 'medium', 'hard']
    const difficultyBreakdown = difficulties.map(difficulty => {
      const answersForDifficulty = completedCandidates.flatMap(c => 
        c.answers.filter(a => a.difficulty === difficulty)
      )
      const avgScore = answersForDifficulty.length > 0
        ? answersForDifficulty.reduce((sum, a) => sum + a.score, 0) / answersForDifficulty.length
        : 0
      return {
        difficulty: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
        avgScore: Math.round(avgScore),
        count: answersForDifficulty.length
      }
    })

    return {
      totalCandidates,
      completedInterviews,
      avgScore,
      avgInterviewTime: Math.round(avgInterviewTime),
      passRate: Math.round(passRate),
      topPerformers,
      scoreDistribution,
      weeklyTrends,
      difficultyBreakdown
    }
  }, [candidates])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Comprehensive interview performance insights</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex border rounded-lg">
            {(['week', 'month', 'quarter'] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "ghost"}
                size="sm"
                className="rounded-none first:rounded-l-lg last:rounded-r-lg"
                onClick={() => setTimeRange(range)}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </Button>
            ))}
          </div>
          
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Interviews</p>
                  <p className="text-3xl font-bold text-blue-600">{analyticsData.totalCandidates}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <div className="mt-4 flex items-center space-x-2 text-sm">
                <Badge variant="secondary">{analyticsData.completedInterviews} completed</Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                  <p className="text-3xl font-bold text-green-600">{analyticsData.avgScore}</p>
                </div>
                <Award className="w-8 h-8 text-green-600" />
              </div>
              <div className="mt-4 flex items-center space-x-2 text-sm">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-green-600">+5% from last week</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pass Rate</p>
                  <p className="text-3xl font-bold text-purple-600">{analyticsData.passRate}%</p>
                </div>
                <Target className="w-8 h-8 text-purple-600" />
              </div>
              <div className="mt-4 flex items-center space-x-2 text-sm">
                <span className="text-muted-foreground">70+ score threshold</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Time</p>
                  <p className="text-3xl font-bold text-orange-600">{formatTime(analyticsData.avgInterviewTime)}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
              <div className="mt-4 flex items-center space-x-2 text-sm">
                <TrendingDown className="w-4 h-4 text-orange-600" />
                <span className="text-orange-600">-2min from avg</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Score Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analyticsData.scoreDistribution.map((item) => (
              <div key={item.range} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.range} points</span>
                  <span className="text-muted-foreground">{item.count} candidates</span>
                </div>
                <Progress value={item.percentage} className="h-2" />
                <div className="text-xs text-muted-foreground text-right">
                  {item.percentage}%
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Weekly Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Weekly Interview Trends</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.weeklyTrends.map((day) => (
                <div key={day.day} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="font-medium">{day.day}</div>
                    <Badge variant="outline">{day.interviews} interviews</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Avg: {day.interviews > 0 ? day.avgScore : '-'}/100
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="w-5 h-5" />
              <span>Top Performers</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.topPerformers.map((candidate, index) => (
                <motion.div
                  key={candidate.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{candidate.name}</div>
                      <div className="text-sm text-muted-foreground">{candidate.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-100 text-green-800">
                      {candidate.score}/100
                    </Badge>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Difficulty Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Performance by Difficulty</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analyticsData.difficultyBreakdown.map((item, index) => (
              <motion.div
                key={item.difficulty}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 border rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{item.difficulty} Questions</span>
                  <Badge variant={item.avgScore >= 70 ? "default" : "secondary"}>
                    {item.avgScore}/100
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  {item.count} answers analyzed
                </div>
                <Progress 
                  value={item.avgScore} 
                  className="h-2"
                />
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}