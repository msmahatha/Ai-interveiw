import { useState, useRef } from 'react'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import {
  Download,
  FileText,
  Mail,
  Printer,
  Share2,
  Star,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  Target,
  Award,
  Calendar
} from 'lucide-react'

import { RootState } from '@/store/store'
import { Candidate } from '@/store/candidatesSlice'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { getScoreColor, generateInitials, formatTime } from '@/lib/utils'
import { exportCandidatePDF, exportCandidateDetailToCSV, createEmailBody, exportElementToPDF, exportCandidatePDFPrint } from '@/utils/exportUtils'

interface ReportData {
  candidate: Candidate
  overallScore: number
  passStatus: 'passed' | 'failed'
  strengths: string[]
  improvements: string[]
  recommendations: string
  interviewDuration: number
  questionsCompleted: number
  averageResponseTime: number
}

export default function InterviewReportsExport() {
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null)
  const [emailRecipients, setEmailRecipients] = useState('')
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState<string | null>(null)
  const printRef = useRef<HTMLDivElement>(null)

  const candidates = useSelector((state: RootState) => state.candidates)
  const allCandidates = candidates.allIds.map(id => candidates.byId[id])
  const completedCandidates = allCandidates.filter(c => c.status === 'completed')

  const selectedCandidate = selectedCandidateId ? candidates.byId[selectedCandidateId] : null

  const generateReportData = (candidate: Candidate): ReportData => {
    const overallScore = candidate.score
    const passStatus: 'passed' | 'failed' = overallScore >= 70 ? 'passed' : 'failed'
    
    // Calculate interview duration
    const interviewDuration = candidate.answers.reduce((sum, answer) => sum + answer.timeTaken, 0)
    
    // Calculate average response time
    const averageResponseTime = candidate.answers.length > 0 
      ? interviewDuration / candidate.answers.length 
      : 0

    // Generate strengths and improvements based on performance
    const strengths: string[] = []
    const improvements: string[] = []

    if (overallScore >= 80) {
      strengths.push('Excellent technical knowledge', 'Strong problem-solving skills', 'Clear communication')
    } else if (overallScore >= 60) {
      strengths.push('Good foundational knowledge', 'Adequate problem-solving approach')
      improvements.push('Deepen technical understanding', 'Improve implementation speed')
    } else {
      improvements.push('Strengthen fundamental concepts', 'Practice coding problems', 'Improve time management')
    }

    // Add specific strengths/improvements based on question performance
    const highScoringAnswers = candidate.answers.filter(a => a.score >= 80)
    const lowScoringAnswers = candidate.answers.filter(a => a.score < 60)

    if (highScoringAnswers.length > 0) {
      strengths.push(`Strong performance in ${highScoringAnswers.length} questions`)
    }

    if (lowScoringAnswers.length > 0) {
      improvements.push(`Needs improvement in ${lowScoringAnswers.length} questions`)
    }

    // Generate recommendations
    let recommendations = ''
    if (passStatus === 'passed') {
      if (overallScore >= 90) {
        recommendations = 'Strong hire recommendation. Candidate demonstrates excellent technical skills and problem-solving abilities.'
      } else if (overallScore >= 80) {
        recommendations = 'Recommend for hire. Solid technical foundation with room for growth in advanced topics.'
      } else {
        recommendations = 'Conditional hire. Consider for junior role with mentoring support.'
      }
    } else {
      recommendations = 'Not recommended for current position. Suggest additional training or different role alignment.'
    }

    return {
      candidate,
      overallScore,
      passStatus,
      strengths: strengths.slice(0, 5), // Limit to top 5
      improvements: improvements.slice(0, 5),
      recommendations,
      interviewDuration,
      questionsCompleted: candidate.answers.length,
      averageResponseTime
    }
  }

  const handlePrintReport = () => {
    if (printRef.current) {
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Interview Report - ${selectedCandidate?.name}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .report-container { max-width: 800px; margin: 0 auto; }
                .header { text-align: center; margin-bottom: 30px; }
                .section { margin-bottom: 20px; }
                .score { font-size: 24px; font-weight: bold; }
                .pass { color: #16a34a; }
                .fail { color: #dc2626; }
                .question { border: 1px solid #e5e7eb; padding: 15px; margin-bottom: 10px; }
                @media print { body { margin: 0; } }
              </style>
            </head>
            <body>
              ${printRef.current.innerHTML}
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
      }
    }
  }

  const handleExportPDF = async () => {
    if (selectedCandidate) {
      setIsExporting(true)
      setExportStatus('Generating PDF report...')
      
      try {
        await exportCandidatePDF(selectedCandidate)
        setExportStatus('PDF exported successfully!')
        setTimeout(() => setExportStatus(null), 3000)
      } catch (error) {
        console.error('PDF export failed:', error)
        setExportStatus('PDF export failed, opening print dialog...')
        // Fallback to print method
        await exportCandidatePDFPrint(selectedCandidate)
        setTimeout(() => setExportStatus(null), 3000)
      } finally {
        setIsExporting(false)
      }
    }
  }

  const handleExportPDFFromHTML = async () => {
    if (selectedCandidate && printRef.current) {
      setIsExporting(true)
      setExportStatus('Converting report to PDF...')
      
      try {
        const timestamp = new Date().toISOString().split('T')[0]
        const filename = `${selectedCandidate.name.replace(/\s+/g, '-')}-visual-report-${timestamp}.pdf`
        await exportElementToPDF(printRef.current, filename)
        setExportStatus('Visual PDF exported successfully!')
        setTimeout(() => setExportStatus(null), 3000)
      } catch (error) {
        console.error('HTML to PDF export failed:', error)
        setExportStatus('Visual PDF export failed, trying alternative method...')
        // Fallback to regular PDF export
        await handleExportPDF()
      } finally {
        setIsExporting(false)
      }
    }
  }

  const handleExportCSV = () => {
    if (selectedCandidate) {
      exportCandidateDetailToCSV(selectedCandidate)
    }
  }

  const handleSendEmail = () => {
    if (!selectedCandidate) return
    
    const subject = emailSubject || `Interview Report - ${selectedCandidate.name}`
    const body = emailBody || createEmailBody(selectedCandidate)
    
    // Create mailto link
    const mailto = `mailto:${emailRecipients}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    
    // Open default email client
    window.location.href = mailto
    
    setShowEmailModal(false)
  }

  const formatScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (!selectedCandidate) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Interview Reports</h2>
            <p className="text-muted-foreground">Generate detailed reports and export candidate evaluations</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Select Candidate for Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedCandidates.map((candidate) => (
                <motion.div
                  key={candidate.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                  className="cursor-pointer"
                  onClick={() => setSelectedCandidateId(candidate.id)}
                >
                  <Card className="hover:shadow-lg transition-shadow border-2 hover:border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600">
                            {generateInitials(candidate.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold">{candidate.name}</h3>
                          <p className="text-sm text-muted-foreground">{candidate.email}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge className={getScoreColor(candidate.score)}>
                              {candidate.score}/100
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(candidate.interviewDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const reportData = generateReportData(selectedCandidate)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => setSelectedCandidateId(null)}
          >
            ← Back to Candidates
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Interview Report</h2>
            <p className="text-muted-foreground">{selectedCandidate.name}</p>
            {exportStatus && (
              <p className="text-sm text-blue-600 mt-1 flex items-center">
                {isExporting && (
                  <motion.div
                    className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full mr-2"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                )}
                {exportStatus}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setShowEmailModal(true)}>
            <Mail className="w-4 h-4 mr-2" />
            Email Report
          </Button>
          <Button variant="outline" onClick={handlePrintReport}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" onClick={handleExportCSV}>
            <FileText className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          
          {/* PDF Export Options */}
          <Button 
            onClick={handleExportPDF}
            disabled={isExporting}
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Generating...' : 'Export PDF'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleExportPDFFromHTML}
            disabled={isExporting}
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Converting...' : 'PDF (Visual)'}
          </Button>
        </div>
      </div>

      {/* Report Content */}
      <div ref={printRef} className="space-y-6">
        {/* Candidate Summary */}
        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Avatar className="w-20 h-20">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-2xl">
                  {generateInitials(selectedCandidate.name)}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-2xl">{selectedCandidate.name}</CardTitle>
            <p className="text-muted-foreground">{selectedCandidate.email}</p>
            <div className="flex items-center justify-center space-x-4 mt-4">
              <div className="text-center">
                <div className={`text-4xl font-bold ${formatScoreColor(reportData.overallScore)}`}>
                  {reportData.overallScore}
                </div>
                <div className="text-sm text-muted-foreground">Overall Score</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  {reportData.passStatus === 'passed' ? (
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  ) : (
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  )}
                </div>
                <div className={`font-semibold ${reportData.passStatus === 'passed' ? 'text-green-600' : 'text-red-600'}`}>
                  {reportData.passStatus === 'passed' ? 'PASSED' : 'FAILED'}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">{formatTime(reportData.interviewDuration)}</div>
              <div className="text-sm text-muted-foreground">Total Duration</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <FileText className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">{reportData.questionsCompleted}</div>
              <div className="text-sm text-muted-foreground">Questions Completed</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Target className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold">{formatTime(reportData.averageResponseTime)}</div>
              <div className="text-sm text-muted-foreground">Avg Response Time</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold">
                {new Date(selectedCandidate.interviewDate).toLocaleDateString()}
              </div>
              <div className="text-sm text-muted-foreground">Interview Date</div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Strengths */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span>Key Strengths</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {reportData.strengths.map((strength, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Improvements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingDown className="w-5 h-5 text-orange-600" />
                <span>Areas for Improvement</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {reportData.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    <span className="text-sm">{improvement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Question-by-Question Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Question Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedCandidate.answers.map((answer, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="font-semibold">Question {index + 1}</span>
                      <Badge className={`${answer.difficulty === 'easy' ? 'bg-green-100 text-green-800' : 
                        answer.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}`}>
                        {answer.difficulty}
                      </Badge>
                      <Badge variant="outline">Technical</Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getScoreColor(answer.score)}>
                        {answer.score}/100
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatTime(answer.timeTaken)} / {formatTime(answer.timeAllowed)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <h4 className="font-medium mb-1">Question:</h4>
                    <p className="text-sm text-muted-foreground">{answer.question}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-1">Answer:</h4>
                    <p className="text-sm">
                      {answer.answer || 'No answer provided'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-blue-600" />
              <span>Hiring Recommendation</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm leading-relaxed">{reportData.recommendations}</p>
            </div>
          </CardContent>
        </Card>

        {/* AI Summary */}
        <Card>
          <CardHeader>
            <CardTitle>AI-Generated Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm leading-relaxed">{selectedCandidate.summary}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full"
          >
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Email Interview Report</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Recipients</label>
                <Input
                  value={emailRecipients}
                  onChange={(e) => setEmailRecipients(e.target.value)}
                  placeholder="email@example.com, email2@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Subject</label>
                <Input
                  value={emailSubject || `Interview Report - ${selectedCandidate.name}`}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder={`Interview Report - ${selectedCandidate.name}`}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <Textarea
                  value={emailBody || createEmailBody(selectedCandidate)}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Please find the interview report details below..."
                  rows={6}
                />
              </div>
            </div>
            
            <div className="p-6 border-t flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowEmailModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendEmail}>
                <Share2 className="w-4 h-4 mr-2" />
                Send Report
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}