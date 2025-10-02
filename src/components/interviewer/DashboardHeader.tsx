import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, Download, RefreshCw, Users, TrendingUp, Award, Calendar, Eye, BarChart3 } from 'lucide-react'

import { AppDispatch, RootState } from '@/store/store'
import { setSearchQuery, setScoreFilter, setSortBy, resetFilters } from '@/store/uiSlice'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { exportCandidatesToCSV } from '@/utils/exportUtils'

export default function DashboardHeader() {
  const dispatch = useDispatch<AppDispatch>()
  const candidates = useSelector((state: RootState) => state.candidates)
  const [showFilters, setShowFilters] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(true)

  const handleSearch = (query: string) => {
    dispatch(setSearchQuery(query))
  }

  const handleScoreFilter = (min: number, max: number) => {
    dispatch(setScoreFilter({ min, max }))
  }

  const handleSort = (field: 'score' | 'date' | 'name') => {
    dispatch(setSortBy(field))
  }

  const handleExportAll = () => {
    if (allCandidates.length === 0) {
      alert('No candidates to export')
      return
    }
    
    exportCandidatesToCSV(allCandidates)
  }

  // Calculate analytics
  const allCandidates = candidates.allIds.map(id => candidates.byId[id])
  const totalCandidates = allCandidates.length
  const completedInterviews = allCandidates.filter(c => c.status === 'completed').length
  const avgScore = totalCandidates > 0 ? Math.round(allCandidates.reduce((sum, c) => sum + c.score, 0) / totalCandidates) : 0
  const todayInterviews = allCandidates.filter(c => {
    const today = new Date().toDateString()
    const interviewDate = new Date(c.interviewDate).toDateString()
    return today === interviewDate
  }).length

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Interview Dashboard</CardTitle>
            <p className="text-muted-foreground">Manage and review candidate interviews</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAnalytics(!showAnalytics)}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              {showAnalytics ? 'Hide' : 'Show'} Stats
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch(resetFilters())}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Analytics Overview */}
        <AnimatePresence>
          {showAnalytics && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t"
            >
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-600">{totalCandidates}</div>
                <div className="text-sm text-blue-600/70">Total Candidates</div>
              </div>

              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                <div className="flex items-center justify-center mb-2">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-600">{completedInterviews}</div>
                <div className="text-sm text-green-600/70">Completed</div>
              </div>

              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-purple-600">{avgScore}</div>
                <div className="text-sm text-purple-600/70">Avg Score</div>
              </div>

              <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                <div className="flex items-center justify-center mb-2">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
                <div className="text-2xl font-bold text-orange-600">{todayInterviews}</div>
                <div className="text-sm text-orange-600/70">Today</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              className="pl-10"
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          {/* Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t"
              >
                {/* Score Range */}
                <div>
                  <label className="block text-sm font-medium mb-2">Score Range</label>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleScoreFilter(80, 100)}
                    >
                      80-100
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleScoreFilter(60, 79)}
                    >
                      60-79
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleScoreFilter(0, 59)}
                    >
                      0-59
                    </Button>
                  </div>
                </div>

                {/* Sort Options */}
                <div>
                  <label className="block text-sm font-medium mb-2">Sort By</label>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSort('score')}
                    >
                      Score
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSort('date')}
                    >
                      Date
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSort('name')}
                    >
                      Name
                    </Button>
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {}}
                    >
                      All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {}}
                    >
                      Completed
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {}}
                    >
                      In Progress
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">
                {totalCandidates} candidates
              </Badge>
              {completedInterviews > 0 && (
                <Badge variant="default">
                  {Math.round((completedInterviews / totalCandidates) * 100)}% completion rate
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportAll}
              >
                <Download className="w-4 h-4 mr-2" />
                Export All CSV
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => alert('Live monitoring coming soon!')}
              >
                <Eye className="w-4 h-4 mr-2" />
                Live Monitor
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}