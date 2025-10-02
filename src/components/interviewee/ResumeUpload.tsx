import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

import { AppDispatch } from '@/store/store'
import { addCandidate } from '@/store/candidatesSlice'
import { startInterview, generateQuestionsAsync } from '@/store/interviewSlice'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn, validateEmail, validatePhone } from '@/lib/utils'

interface ExtractedData {
  name: string
  email: string
  phone: string
}

export default function ResumeUpload() {
  const dispatch = useDispatch<AppDispatch>()
  const [isParsing, setIsParsing] = useState(false)
  const [isStartingInterview, setIsStartingInterview] = useState(false)
  const [showDetailsForm, setShowDetailsForm] = useState(false)
  const [extractedData, setExtractedData] = useState<ExtractedData>({
    name: '',
    email: '',
    phone: ''
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size too large', {
        description: 'Please upload a file smaller than 5MB'
      })
      return
    }

    setIsParsing(true)

    try {
      // Simulate parsing delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Mock extracted data (in real app, this would parse the PDF/DOCX)
      const mockData: ExtractedData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890'
      }

      setExtractedData(mockData)
      setShowDetailsForm(true)
      
      // Show form for user to review and edit details
      toast.success('Resume parsed successfully! Please review and confirm your details below.')
      
    } catch (error) {
      toast.error('Failed to parse resume', {
        description: 'Please try a different file format'
      })
    } finally {
      setIsParsing(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    disabled: isParsing
  })

  const validateForm = (data: ExtractedData = extractedData) => {
    const newErrors: { [key: string]: string } = {}

    if (!data.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!data.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(data.email)) {
      newErrors.email = 'Invalid email format'
    }

    if (!data.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!validatePhone(data.phone)) {
      newErrors.phone = 'Invalid phone number format'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }



  const handleStartInterview = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors before continuing')
      return
    }

    setIsStartingInterview(true)

    try {
      // Generate candidate ID and add to store
      const candidateId = Date.now().toString()
      dispatch(addCandidate({
        id: candidateId,
        name: extractedData.name,
        email: extractedData.email,
        phone: extractedData.phone
      }))

      // Generate personalized questions using Gemini AI
      toast.info('🤖 Generating personalized questions with AI...')
      
      try {
        await dispatch(generateQuestionsAsync({
          name: extractedData.name,
          email: extractedData.email,
          role: 'Full Stack Developer'
        })).unwrap()
        toast.success('✨ AI-powered questions ready!')
      } catch (error) {
        console.warn('Failed to generate AI questions, using fallback questions:', error)
        toast.info('Using standard questions for your interview')
      }
      
      // Start interview
      dispatch(startInterview({ candidateId }))

      toast.success('Interview started! Good luck! 🚀')
    } catch (error) {
      toast.error('Failed to start interview. Please try again.')
      setIsStartingInterview(false)
    }
  }

  const handleInputChange = (field: keyof ExtractedData, value: string) => {
    setExtractedData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
          <CardHeader className="text-center">
            <motion.div
              className="w-16 h-16 gradient-primary rounded-2xl mx-auto mb-4 flex items-center justify-center"
              animate={{ rotate: isParsing ? 360 : 0 }}
              transition={{ duration: 2, repeat: isParsing ? Infinity : 0 }}
            >
              <span className="text-2xl">📄</span>
            </motion.div>
            <CardTitle className="text-2xl mb-2">Welcome to Crisp! 👋</CardTitle>
            <CardDescription className="text-lg">
              Upload your resume to begin your AI-powered interview experience
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all",
                isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400",
                isParsing && "opacity-50 cursor-not-allowed"
              )}
            >
              <input {...getInputProps()} />
              
              <AnimatePresence>
                {isParsing ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                    <p className="text-lg font-medium">Parsing your resume...</p>
                    <p className="text-sm text-muted-foreground">Extracting your information with AI magic ✨</p>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="text-4xl mb-4">
                      {isDragActive ? '📂' : '📁'}
                    </div>
                    <p className="text-lg font-medium">
                      {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Supports PDF and DOCX files up to 5MB
                    </p>
                    <Button variant="outline" className="mt-4">
                      Choose File
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {showDetailsForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-8 space-y-6"
                >
                  <div className="text-center">
                    {isStartingInterview ? (
                      <>
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                        <h3 className="text-lg font-semibold mb-2">🚀 Starting Your Interview...</h3>
                        <p className="text-sm text-muted-foreground">
                          Get ready! Your technical interview is about to begin.
                        </p>
                      </>
                    ) : (
                      <>
                        <h3 className="text-lg font-semibold mb-2">✅ Resume Parsed!</h3>
                        <p className="text-sm text-muted-foreground">
                          Please review and confirm your information below before starting the interview
                        </p>
                      </>
                    )}
                  </div>

                  {!isStartingInterview && (
                  <>
                  <div className="grid gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Full Name</label>
                      <Input
                        value={extractedData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter your full name"
                        className={errors.name ? 'border-red-500' : ''}
                      />
                      {errors.name && (
                        <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Email Address</label>
                      <Input
                        type="email"
                        value={extractedData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="your.email@example.com"
                        className={errors.email ? 'border-red-500' : ''}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Phone Number</label>
                      <Input
                        type="tel"
                        value={extractedData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="+1234567890"
                        className={errors.phone ? 'border-red-500' : ''}
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={handleStartInterview}
                    className="w-full"
                    variant="gradient"
                    size="lg"
                  >
                    🚀 Start Interview
                  </Button>
                  </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}