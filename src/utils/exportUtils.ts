/**
 * Export utilities for generating CSV, Excel, and PDF files
 */

import { Candidate } from '@/store/candidatesSlice'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

// Convert array of objects to CSV string
export const convertToCSV = (data: any[]): string => {
  if (data.length === 0) return ''

  const headers = Object.keys(data[0])
  const csvHeaders = headers.join(',')
  
  const csvRows = data.map(row => {
    return headers.map(header => {
      let value = row[header]
      
      // Handle different data types
      if (value === null || value === undefined) {
        value = ''
      } else if (typeof value === 'object') {
        value = JSON.stringify(value)
      } else if (typeof value === 'string') {
        // Escape quotes and wrap in quotes if contains comma
        value = value.replace(/"/g, '""')
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          value = `"${value}"`
        }
      }
      
      return value
    }).join(',')
  })
  
  return [csvHeaders, ...csvRows].join('\n')
}

// Download file with given content and filename
export const downloadFile = (content: string, filename: string, mimeType: string = 'text/plain') => {
  const blob = new Blob([content], { type: mimeType })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

// Export candidates data to CSV
export const exportCandidatesToCSV = (candidates: Candidate[]) => {
  const exportData = candidates.map(candidate => ({
    id: candidate.id,
    name: candidate.name,
    email: candidate.email,
    phone: candidate.phone,
    score: candidate.score,
    status: candidate.status,
    interviewDate: new Date(candidate.interviewDate).toLocaleDateString(),
    interviewTime: new Date(candidate.interviewDate).toLocaleTimeString(),
    interviewStartTime: candidate.interviewStartTime,
    interviewEndTime: candidate.interviewEndTime || 'N/A',
    totalQuestions: candidate.answers.length,
    averageScore: candidate.answers.length > 0 
      ? Math.round(candidate.answers.reduce((sum, ans) => sum + ans.score, 0) / candidate.answers.length)
      : 0,
    totalTimeTaken: candidate.answers.reduce((sum, ans) => sum + ans.timeTaken, 0),
    summary: candidate.summary?.replace(/\n/g, ' ').replace(/,/g, ';') || ''
  }))

  const csvContent = convertToCSV(exportData)
  const timestamp = new Date().toISOString().split('T')[0]
  downloadFile(csvContent, `candidates-export-${timestamp}.csv`, 'text/csv')
}

// Export detailed candidate report to CSV
export const exportCandidateDetailToCSV = (candidate: Candidate) => {
  const detailData = candidate.answers.map((answer, index) => ({
    candidateName: candidate.name,
    candidateEmail: candidate.email,
    questionNumber: index + 1,
    question: answer.question?.replace(/\n/g, ' ').replace(/,/g, ';') || '',
    answer: answer.answer?.replace(/\n/g, ' ').replace(/,/g, ';') || '',
    score: answer.score,
    timeTaken: answer.timeTaken,
    timeAllowed: answer.timeAllowed,
    difficulty: answer.difficulty
  }))

  const csvContent = convertToCSV(detailData)
  const timestamp = new Date().toISOString().split('T')[0]
  downloadFile(csvContent, `${candidate.name.replace(/\s+/g, '-')}-detail-${timestamp}.csv`, 'text/csv')
}

// Generate HTML content for PDF export
export const generateReportHTML = (candidate: Candidate): string => {
  const overallScore = candidate.score
  const passStatus = overallScore >= 70 ? 'PASSED' : 'FAILED'
  const interviewDuration = candidate.answers.reduce((sum, answer) => sum + answer.timeTaken, 0)
  const averageResponseTime = candidate.answers.length > 0 ? interviewDuration / candidate.answers.length : 0
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Interview Report - ${candidate.name}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background: #f8f9fa;
        }
        .report-container {
          background: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 3px solid #007bff;
        }
        .candidate-name {
          font-size: 32px;
          font-weight: bold;
          color: #007bff;
          margin-bottom: 5px;
        }
        .candidate-email {
          font-size: 16px;
          color: #666;
        }
        .score-section {
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 20px 0;
          gap: 40px;
        }
        .overall-score {
          text-align: center;
        }
        .score-number {
          font-size: 48px;
          font-weight: bold;
          color: ${overallScore >= 80 ? '#28a745' : overallScore >= 60 ? '#ffc107' : '#dc3545'};
        }
        .pass-status {
          text-align: center;
          padding: 10px 20px;
          border-radius: 25px;
          font-weight: bold;
          color: white;
          background: ${passStatus === 'PASSED' ? '#28a745' : '#dc3545'};
        }
        .metrics {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 20px;
          margin: 30px 0;
        }
        .metric-card {
          text-align: center;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid #007bff;
        }
        .metric-value {
          font-size: 24px;
          font-weight: bold;
          color: #007bff;
        }
        .metric-label {
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
          margin-top: 5px;
        }
        .section {
          margin: 30px 0;
        }
        .section-title {
          font-size: 20px;
          font-weight: bold;
          color: #333;
          margin-bottom: 15px;
          padding-bottom: 8px;
          border-bottom: 2px solid #e9ecef;
        }
        .question-block {
          margin-bottom: 20px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid #007bff;
        }
        .question-header {
          display: flex;
          justify-content: between;
          align-items: center;
          margin-bottom: 10px;
        }
        .question-number {
          font-weight: bold;
          color: #007bff;
        }
        .question-score {
          float: right;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          color: white;
          background: ${overallScore >= 80 ? '#28a745' : overallScore >= 60 ? '#ffc107' : '#dc3545'};
        }
        .question-text {
          font-weight: bold;
          margin-bottom: 10px;
        }
        .answer-text {
          background: white;
          padding: 15px;
          border-radius: 5px;
          border: 1px solid #dee2e6;
          margin-top: 10px;
        }
        .summary-section {
          background: linear-gradient(135deg, #007bff, #0056b3);
          color: white;
          padding: 25px;
          border-radius: 8px;
          margin: 30px 0;
        }
        .summary-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 15px;
        }
        @media print {
          body { background: white; }
          .report-container { box-shadow: none; }
        }
      </style>
    </head>
    <body>
      <div class="report-container">
        <div class="header">
          <div class="candidate-name">${candidate.name}</div>
          <div class="candidate-email">${candidate.email}</div>
          <div class="score-section">
            <div class="overall-score">
              <div class="score-number">${overallScore}</div>
              <div>Overall Score</div>
            </div>
            <div class="pass-status">${passStatus}</div>
          </div>
        </div>

        <div class="metrics">
          <div class="metric-card">
            <div class="metric-value">${formatTime(interviewDuration)}</div>
            <div class="metric-label">Total Duration</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${candidate.answers.length}</div>
            <div class="metric-label">Questions Completed</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${formatTime(Math.round(averageResponseTime))}</div>
            <div class="metric-label">Avg Response Time</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${new Date(candidate.interviewDate).toLocaleDateString()}</div>
            <div class="metric-label">Interview Date</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Question-by-Question Analysis</div>
          ${candidate.answers.map((answer, index) => `
            <div class="question-block">
              <div class="question-header">
                <span class="question-number">Question ${index + 1}</span>
                <span class="question-score">${answer.score}/100</span>
              </div>
              <div class="question-text">${answer.question || 'Question text not available'}</div>
              <div class="answer-text">${answer.answer || 'No answer provided'}</div>
              <div style="margin-top: 10px; font-size: 12px; color: #666;">
                Time taken: ${formatTime(answer.timeTaken)} | Difficulty: ${answer.difficulty}
              </div>
            </div>
          `).join('')}
        </div>

        <div class="summary-section">
          <div class="summary-title">AI-Generated Summary</div>
          <div>${candidate.summary || 'No summary available'}</div>
        </div>
      </div>
    </body>
    </html>
  `
}

// Export single candidate report as PDF using jsPDF
export const exportCandidatePDF = async (candidate: Candidate) => {
  try {
    // Create PDF document
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    let yPosition = 20
    
    // Helper function to add text with word wrap
    const addText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10) => {
      pdf.setFontSize(fontSize)
      const lines = pdf.splitTextToSize(text, maxWidth)
      pdf.text(lines, x, y)
      return y + (lines.length * fontSize * 0.5) // Return new Y position
    }
    
    // Header
    pdf.setFillColor(0, 123, 255) // Blue background
    pdf.rect(0, 0, pageWidth, 30, 'F')
    
    pdf.setTextColor(255, 255, 255) // White text
    pdf.setFontSize(20)
    pdf.text('INTERVIEW REPORT', pageWidth / 2, 15, { align: 'center' })
    
    pdf.setTextColor(0, 0, 0) // Reset to black
    yPosition = 40
    
    // Candidate Information
    pdf.setFontSize(16)
    pdf.text('Candidate Information', 20, yPosition)
    yPosition += 10
    
    pdf.setFontSize(12)
    pdf.text(`Name: ${candidate.name}`, 20, yPosition)
    yPosition += 7
    pdf.text(`Email: ${candidate.email}`, 20, yPosition)
    yPosition += 7
    pdf.text(`Phone: ${candidate.phone}`, 20, yPosition)
    yPosition += 7
    pdf.text(`Interview Date: ${new Date(candidate.interviewDate).toLocaleDateString()}`, 20, yPosition)
    yPosition += 15
    
    // Overall Score Section
    pdf.setFillColor(248, 249, 250) // Light gray background
    pdf.rect(15, yPosition - 5, pageWidth - 30, 25, 'F')
    
    pdf.setFontSize(14)
    pdf.text('Overall Performance', 20, yPosition + 5)
    
    const overallScore = candidate.score
    const passStatus = overallScore >= 70 ? 'PASSED' : 'FAILED'
    
    // Score with color coding
    if (overallScore >= 80) {
      pdf.setTextColor(40, 167, 69) // Green
    } else if (overallScore >= 60) {
      pdf.setTextColor(255, 193, 7) // Yellow
    } else {
      pdf.setTextColor(220, 53, 69) // Red
    }
    
    pdf.setFontSize(24)
    pdf.text(`${overallScore}/100`, 20, yPosition + 15)
    
    pdf.setTextColor(0, 0, 0) // Reset to black
    pdf.setFontSize(14)
    pdf.text(`Status: ${passStatus}`, 100, yPosition + 15)
    
    yPosition += 35
    
    // Performance Metrics
    pdf.setFontSize(14)
    pdf.text('Performance Metrics', 20, yPosition)
    yPosition += 10
    
    const totalDuration = candidate.answers.reduce((sum, answer) => sum + answer.timeTaken, 0)
    const averageResponseTime = candidate.answers.length > 0 ? totalDuration / candidate.answers.length : 0
    
    pdf.setFontSize(10)
    pdf.text(`Questions Completed: ${candidate.answers.length}`, 20, yPosition)
    yPosition += 6
    pdf.text(`Total Duration: ${Math.floor(totalDuration / 60)}:${(totalDuration % 60).toString().padStart(2, '0')}`, 20, yPosition)
    yPosition += 6
    pdf.text(`Average Response Time: ${Math.floor(averageResponseTime / 60)}:${Math.round(averageResponseTime % 60).toString().padStart(2, '0')}`, 20, yPosition)
    yPosition += 15
    
    // Question Analysis
    pdf.setFontSize(14)
    pdf.text('Question-by-Question Analysis', 20, yPosition)
    yPosition += 10
    
    candidate.answers.forEach((answer, index) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 50) {
        pdf.addPage()
        yPosition = 20
      }
      
      // Question header
      pdf.setFillColor(240, 240, 240)
      pdf.rect(15, yPosition - 3, pageWidth - 30, 8, 'F')
      
      pdf.setFontSize(12)
      pdf.text(`Question ${index + 1}`, 20, yPosition + 2)
      
      // Score with color
      if (answer.score >= 80) {
        pdf.setTextColor(40, 167, 69)
      } else if (answer.score >= 60) {
        pdf.setTextColor(255, 193, 7)
      } else {
        pdf.setTextColor(220, 53, 69)
      }
      pdf.text(`${answer.score}/100`, pageWidth - 40, yPosition + 2)
      pdf.setTextColor(0, 0, 0)
      
      yPosition += 12
      
      // Question text
      pdf.setFontSize(10)
      const questionText = answer.question || 'Question text not available'
      yPosition = addText(`Q: ${questionText}`, 20, yPosition, pageWidth - 40, 10)
      yPosition += 3
      
      // Answer text
      const answerText = answer.answer || 'No answer provided'
      yPosition = addText(`A: ${answerText}`, 20, yPosition, pageWidth - 40, 9)
      yPosition += 3
      
      // Metrics
      pdf.setFontSize(8)
      pdf.setTextColor(100, 100, 100)
      pdf.text(`Time: ${Math.floor(answer.timeTaken / 60)}:${(answer.timeTaken % 60).toString().padStart(2, '0')} | Difficulty: ${answer.difficulty}`, 20, yPosition)
      pdf.setTextColor(0, 0, 0)
      yPosition += 10
    })
    
    // AI Summary
    if (candidate.summary && yPosition < pageHeight - 40) {
      if (yPosition > pageHeight - 60) {
        pdf.addPage()
        yPosition = 20
      }
      
      pdf.setFontSize(14)
      pdf.text('AI-Generated Summary', 20, yPosition)
      yPosition += 10
      
      pdf.setFillColor(230, 247, 255)
      const summaryHeight = Math.min(40, (candidate.summary.length / 100) * 10 + 15)
      pdf.rect(15, yPosition - 5, pageWidth - 30, summaryHeight, 'F')
      
      yPosition = addText(candidate.summary, 20, yPosition, pageWidth - 40, 10)
    }
    
    // Save the PDF
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `${candidate.name.replace(/\s+/g, '-')}-interview-report-${timestamp}.pdf`
    pdf.save(filename)
    
  } catch (error) {
    console.error('Error generating PDF:', error)
    // Fallback to print method
    exportCandidatePDFPrint(candidate)
  }
}

// Alternative method: Convert HTML element to PDF using html2canvas
export const exportElementToPDF = async (element: HTMLElement, filename: string) => {
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    })
    
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    
    const imgWidth = 210 // A4 width in mm
    const pageHeight = 295 // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    
    let position = 0
    
    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
    
    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }
    
    pdf.save(filename)
  } catch (error) {
    console.error('Error converting HTML to PDF:', error)
    throw error
  }
}

// Fallback print method
export const exportCandidatePDFPrint = async (candidate: Candidate) => {
  const html = generateReportHTML(candidate)
  
  // Create a new window with the HTML content for printing
  const printWindow = window.open('', '_blank', 'width=800,height=600')
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
    
    // Wait for content to load then trigger print dialog
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print()
      }, 500)
    }
  }
}

// Create email body for sharing reports
export const createEmailBody = (candidate: Candidate): string => {
  const passStatus = candidate.score >= 70 ? 'PASSED' : 'FAILED'
  
  return `Dear Team,

Please find the interview report for ${candidate.name} below:

Candidate Details:
- Name: ${candidate.name}
- Email: ${candidate.email}
- Phone: ${candidate.phone}
- Interview Date: ${new Date(candidate.interviewDate).toLocaleDateString()}

Interview Results:
- Overall Score: ${candidate.score}/100
- Status: ${passStatus}
- Questions Completed: ${candidate.answers.length}
- Total Time: ${Math.floor(candidate.answers.reduce((sum, ans) => sum + ans.timeTaken, 0) / 60)} minutes

${candidate.summary ? `
AI Summary:
${candidate.summary}
` : ''}

Best regards,
Interview System`
}