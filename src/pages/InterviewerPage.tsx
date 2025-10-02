import { useState } from 'react'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { BarChart3, Monitor, Settings, FileText, Users } from 'lucide-react'

import { RootState } from '@/store/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import DashboardHeader from '@/components/interviewer/DashboardHeader'
import CandidateGrid from '@/components/interviewer/CandidateGrid'
import CandidateDetail from '@/components/interviewer/CandidateDetail'
import EmptyState from '@/components/interviewer/EmptyState'
import LiveInterviewMonitor from '@/components/interviewer/LiveInterviewMonitor'
import InterviewAnalyticsDashboard from '@/components/interviewer/InterviewAnalyticsDashboard'
import InterviewManagement from '@/components/interviewer/InterviewManagement'
import InterviewReportsExport from '@/components/interviewer/InterviewReportsExport'

type InterviewerView = 'dashboard' | 'monitor' | 'analytics' | 'management' | 'reports'

export default function InterviewerPage() {
  const [activeView, setActiveView] = useState<InterviewerView>('dashboard')
  const candidates = useSelector((state: RootState) => state.candidates)
  const { selectedCandidateId } = useSelector((state: RootState) => state.ui)

  const filteredCandidates = candidates.allIds.map(id => candidates.byId[id])

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Users },
    { id: 'monitor', label: 'Live Monitor', icon: Monitor },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'management', label: 'Management', icon: Settings },
    { id: 'reports', label: 'Reports', icon: FileText }
  ]

  const renderView = () => {
    switch (activeView) {
      case 'monitor':
        return <LiveInterviewMonitor />
      case 'analytics':
        return <InterviewAnalyticsDashboard />
      case 'management':
        return <InterviewManagement />
      case 'reports':
        return <InterviewReportsExport />
      default:
        return (
          <>
            <DashboardHeader />
            {filteredCandidates.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                  <CandidateGrid candidates={filteredCandidates} />
                </div>
                
                <div className="lg:col-span-1">
                  {selectedCandidateId && candidates.byId[selectedCandidateId] ? (
                    <CandidateDetail candidate={candidates.byId[selectedCandidateId]} />
                  ) : (
                    <Card className="sticky top-24">
                      <CardContent className="p-6 text-center text-muted-foreground">
                        <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                          <span className="text-2xl">👤</span>
                        </div>
                        <p>Select a candidate to view details</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </>
        )
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Navigation */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <Button
                    key={item.id}
                    variant={activeView === item.id ? "default" : "ghost"}
                    onClick={() => setActiveView(item.id as InterviewerView)}
                    className="flex items-center space-x-2"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <motion.div
          key={activeView}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderView()}
        </motion.div>
      </motion.div>
    </div>
  )
}