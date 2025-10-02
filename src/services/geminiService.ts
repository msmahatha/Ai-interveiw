import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'

// Initialize Gemini AI
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY
let genAI: GoogleGenerativeAI | null = null

if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY)
}

// Safety settings for content generation
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
]

// Generation configuration
const generationConfig = {
  temperature: 0.7,
  topP: 0.8,
  topK: 40,
  maxOutputTokens: 1024,
}

export interface InterviewQuestion {
  id: string
  text: string
  difficulty: 'easy' | 'medium' | 'hard'
  timeLimit: number
  category: string
}

export interface CandidateProfile {
  name: string
  email: string
  resumeText?: string
  role: string
  experience?: string
  skills?: string[]
}

export interface ScoreResult {
  score: number
  feedback: string
  strengths: string[]
  improvements: string[]
}

/**
 * Generate interview questions based on candidate profile
 */
export async function generateInterviewQuestions(
  profile: CandidateProfile,
  count: number = 6
): Promise<InterviewQuestion[]> {
  if (!genAI) {
    return getFallbackQuestions(count)
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-pro",
      safetySettings,
      generationConfig
    })

    const prompt = `
Generate ${count} technical interview questions for a ${profile.role} candidate named ${profile.name}.

Candidate Profile:
- Name: ${profile.name}
- Email: ${profile.email}
- Role: ${profile.role}
${profile.experience ? `- Experience: ${profile.experience}` : ''}
${profile.skills ? `- Skills: ${profile.skills.join(', ')}` : ''}
${profile.resumeText ? `- Resume Summary: ${profile.resumeText.substring(0, 500)}...` : ''}

Requirements:
1. Generate exactly ${count} questions
2. Mix of difficulties: 2 easy, 2 medium, 2 hard
3. Focus on practical coding and system design concepts
4. Questions should be relevant to Full Stack Development
5. Each question should be clear and specific
6. Include appropriate time limits (easy: 20s, medium: 60s, hard: 120s)

Format your response as a JSON array with the following structure:
[
  {
    "text": "Question text here",
    "difficulty": "easy|medium|hard",
    "timeLimit": 20|60|120,
    "category": "React|Node.js|System Design|JavaScript|Database|etc"
  }
]

Generate questions that test both theoretical knowledge and practical problem-solving skills.
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Try to parse JSON response
    try {
      const questionsData = JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim())
      
      const questions: InterviewQuestion[] = questionsData.map((q: any, index: number) => ({
        id: `gemini-${Date.now()}-${index}`,
        text: q.text,
        difficulty: q.difficulty || 'medium',
        timeLimit: q.timeLimit || 60,
        category: q.category || 'General'
      }))

      return questions.length === count ? questions : getFallbackQuestions(count)
    } catch (parseError) {
      console.warn('Failed to parse Gemini questions response, using fallback')
      return getFallbackQuestions(count)
    }

  } catch (error) {
    console.error('Error generating questions with Gemini:', error)
    return getFallbackQuestions(count)
  }
}

/**
 * Score candidate answer using Gemini AI
 */
export async function scoreAnswer(
  question: string,
  answer: string,
  difficulty: 'easy' | 'medium' | 'hard',
  timeLimit: number,
  timeTaken: number
): Promise<ScoreResult> {
  console.log('🔍 GEMINI SCORING DEBUG:')
  console.log('- API Key configured:', !!API_KEY)
  console.log('- GenAI instance:', !!genAI)
  console.log('- Question:', question.substring(0, 50) + '...')
  console.log('- Answer length:', answer.length)
  console.log('- Answer:', answer.substring(0, 100) + '...')

  if (!genAI || !answer.trim()) {
    console.log('❌ Using fallback scoring - no Gemini AI available')
    return getFallbackScore(question, answer, difficulty, timeTaken, timeLimit)
  }

  try {
    console.log('🤖 Calling Gemini AI for scoring...')
    const model = genAI.getGenerativeModel({ 
      model: "gemini-pro",
      safetySettings,
      generationConfig
    })

    const prompt = `
You are a strict technical interviewer evaluating a candidate's answer. Be critical and accurate in your assessment.

Question (${difficulty} level): ${question}

Candidate Answer: ${answer}

Time Details:
- Time Limit: ${timeLimit} seconds
- Time Taken: ${timeTaken} seconds
- Efficiency: ${Math.round((timeTaken / timeLimit) * 100)}%

STRICT Scoring Criteria (0-100 total):
1. Technical Accuracy (50 points): 
   - Completely correct information = 50 points
   - Mostly correct with minor errors = 35-40 points
   - Some correct concepts but significant mistakes = 20-30 points
   - Incorrect or misleading information = 0-15 points

2. Completeness (25 points):
   - Addresses ALL aspects of the question = 25 points
   - Addresses most key aspects = 15-20 points
   - Addresses some aspects but missing key points = 5-10 points
   - Barely addresses the question = 0-5 points

3. Clarity & Structure (15 points):
   - Well-organized, clear explanation with examples = 15 points
   - Good structure, mostly clear = 10-12 points
   - Some organization but unclear in parts = 5-8 points
   - Poor organization, hard to follow = 0-4 points

4. Time Efficiency (10 points):
   - Efficient use of time (≤80% of limit) = 10 points
   - Reasonable timing (80-100%) = 7-8 points
   - Slightly over time but acceptable = 3-5 points
   - Poor time management (>120%) = 0-2 points

SPECIAL PENALTIES:
- Empty or one-word answers: Maximum 10 points
- Completely off-topic: Maximum 5 points
- Nonsensical or gibberish: Maximum 5 points
- Copy-paste or obviously fake answers: Maximum 15 points

For ${difficulty} questions, expect:
- Easy: Basic understanding, correct syntax, simple examples
- Medium: Deeper concepts, practical applications, trade-offs
- Hard: System design, scalability, optimization, best practices

SCORING GUIDELINES:
- Exceptional answers (90-100): Perfect technical accuracy + comprehensive + excellent examples + efficient
- Excellent answers (80-89): Very good technical knowledge + mostly complete + good examples
- Good answers (65-79): Solid understanding + addresses key points + minor gaps
- Average answers (50-64): Basic understanding + some correct concepts + missing details
- Poor answers (25-49): Limited understanding + significant errors + incomplete
- Very poor answers (0-24): Incorrect information + off-topic + no understanding

Provide your response in JSON format:
{
  "score": 65,
  "feedback": "Detailed assessment explaining the score with specific reasoning...",
  "strengths": ["Specific technical strengths demonstrated"],
  "improvements": ["Specific technical areas needing improvement"]
}

Be fair but accurate. Award points for correct concepts even if presentation is imperfect.
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    console.log('✅ Gemini AI Response received')
    console.log('- Raw response length:', text.length)
    console.log('- Raw response preview:', text.substring(0, 200) + '...')

    try {
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim()
      console.log('- Cleaned JSON:', cleanedText.substring(0, 300) + '...')
      
      const scoreData = JSON.parse(cleanedText)
      console.log('- Parsed score data:', scoreData)
      
      const finalResult = {
        score: Math.max(0, Math.min(100, scoreData.score || 0)),
        feedback: scoreData.feedback || 'Answer evaluated by AI.',
        strengths: Array.isArray(scoreData.strengths) ? scoreData.strengths : [],
        improvements: Array.isArray(scoreData.improvements) ? scoreData.improvements : []
      }
      
      console.log('🎯 Final Gemini Score:', finalResult.score)
      console.log('📝 Gemini Feedback:', finalResult.feedback.substring(0, 100) + '...')
      
      return finalResult
    } catch (parseError) {
      console.warn('❌ Failed to parse Gemini score response:', parseError)
      console.warn('Raw response that failed to parse:', text)
      return getFallbackScore(question, answer, difficulty, timeTaken, timeLimit)
    }

  } catch (error) {
    console.error('❌ Error scoring answer with Gemini:', error)
    return getFallbackScore(question, answer, difficulty, timeTaken, timeLimit)
  }
}

/**
 * Generate a comprehensive interview summary using Gemini AI
 */
export async function generateInterviewSummary(
  candidateName: string,
  answers: Array<{
    question: string
    answer: string
    score: number
    difficulty: string
    timeTaken: number
  }>,
  overallScore: number
): Promise<string> {
  if (!genAI) {
    return getFallbackSummary(candidateName, answers, overallScore)
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-pro",
      safetySettings,
      generationConfig
    })

    const answersText = answers.map((a, i) => `
Q${i + 1} (${a.difficulty}): ${a.question}
Answer: ${a.answer}
Score: ${a.score}/100
Time: ${a.timeTaken}s
`).join('\n')

    const prompt = `
Generate a comprehensive interview summary for ${candidateName}.

Overall Score: ${overallScore}/100

Interview Responses:
${answersText}

Please provide a professional 2-3 paragraph summary that includes:
1. Overall performance assessment
2. Key technical strengths demonstrated
3. Areas for improvement
4. Recommendation (Strong Hire/Hire/Maybe/No Hire)

Keep the tone professional and constructive. Focus on specific technical skills and problem-solving abilities demonstrated during the interview.
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text() || getFallbackSummary(candidateName, answers, overallScore)

  } catch (error) {
    console.error('Error generating summary with Gemini:', error)
    return getFallbackSummary(candidateName, answers, overallScore)
  }
}

// Fallback functions for when Gemini is not available

function getFallbackQuestions(count: number): InterviewQuestion[] {
  const fallbackQuestions = [
    {
      id: 'fallback-1',
      text: 'Explain the difference between state and props in React. When would you use each?',
      difficulty: 'easy' as const,
      timeLimit: 20,
      category: 'React'
    },
    {
      id: 'fallback-2',
      text: 'What is the purpose of useEffect hook and how do you handle cleanup?',
      difficulty: 'easy' as const,
      timeLimit: 20,
      category: 'React'
    },
    {
      id: 'fallback-3',
      text: 'Describe how you would implement a custom hook in React. Give an example.',
      difficulty: 'medium' as const,
      timeLimit: 60,
      category: 'React'
    },
    {
      id: 'fallback-4',
      text: 'Explain the concept of middleware in Express.js and how you would use it for authentication.',
      difficulty: 'medium' as const,
      timeLimit: 60,
      category: 'Node.js'
    },
    {
      id: 'fallback-5',
      text: 'Design a scalable REST API for a social media platform. Consider rate limiting, caching, and database design.',
      difficulty: 'hard' as const,
      timeLimit: 120,
      category: 'System Design'
    },
    {
      id: 'fallback-6',
      text: 'Explain how you would optimize a React application with performance issues. Include specific techniques and tools.',
      difficulty: 'hard' as const,
      timeLimit: 120,
      category: 'React'
    }
  ]

  return fallbackQuestions.slice(0, count)
}

function getFallbackScore(
  question: string,
  answer: string,
  difficulty: 'easy' | 'medium' | 'hard',
  timeTaken: number,
  timeLimit: number
): ScoreResult {
  console.log('⚠️ USING FALLBACK SCORING (not Gemini AI)')
  console.log('- Question:', question.substring(0, 50) + '...')
  console.log('- Answer length:', answer.length)
  console.log('- Difficulty:', difficulty)
  console.log('- Time taken/limit:', timeTaken, '/', timeLimit)
  
  let score = 0
  const answerText = answer.toLowerCase().trim()
  const questionText = question.toLowerCase()
  
  // Base scoring on answer quality indicators
  if (!answerText || answerText.length < 5) {
    score = 5 // Minimal points for no effort
  } else {
    // Length factor (up to 40 points)
    const lengthScore = Math.min(40, answerText.length * 0.2)
    
    // Technical keyword detection (up to 30 points)
    const technicalKeywords = ['function', 'component', 'state', 'props', 'hook', 'api', 'database', 'server', 'client', 'async', 'await', 'promise', 'callback', 'event', 'method', 'class', 'object', 'array', 'string', 'number', 'boolean', 'null', 'undefined', 'return', 'import', 'export', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'try', 'catch']
    const keywordMatches = technicalKeywords.filter(keyword => answerText.includes(keyword)).length
    let keywordScore = Math.min(30, keywordMatches * 2)
    
    // Bonus points if answer addresses specific concepts mentioned in question
    const questionKeywords = questionText.match(/\b(react|node|express|javascript|typescript|database|api|state|props|hook|component)\b/g) || []
    const relevantAnswers = questionKeywords.filter(keyword => answerText.includes(keyword)).length
    keywordScore += Math.min(10, relevantAnswers * 3) // Bonus for relevance
    
    // Structure indicators (up to 20 points)
    let structureScore = 0
    if (answerText.includes('example') || answerText.includes('for instance')) structureScore += 5
    if (answerText.match(/\d+\./)) structureScore += 5 // Numbered lists
    if (answerText.includes('because') || answerText.includes('since')) structureScore += 5 // Explanations
    if (answerText.split('. ').length > 3) structureScore += 5 // Multiple sentences
    
    // Effort indicators (up to 10 points)
    let effortScore = 0
    if (answerText.length > 100) effortScore += 3
    if (answerText.length > 200) effortScore += 3
    if (answerText.includes('would') || answerText.includes('could')) effortScore += 2 // Thoughtful language
    if (answerText.includes('best practice') || answerText.includes('recommend')) effortScore += 2
    
    score = lengthScore + keywordScore + structureScore + effortScore
  }
  
  // Time efficiency bonus/penalty
  const timeEfficiency = timeTaken / timeLimit
  if (timeEfficiency <= 0.5) score += 5 // Bonus for being very efficient
  else if (timeEfficiency <= 0.8) score += 2 // Small bonus for good timing
  else if (timeEfficiency > 1.2) score -= Math.min(15, (timeEfficiency - 1) * 20) // Penalty for overtime
  
  // Difficulty adjustment
  const difficultyMultiplier = {
    'easy': 1.1,    // Easier questions get slight boost
    'medium': 1.0,  // No adjustment
    'hard': 0.9     // Harder questions are more forgiving
  }[difficulty]
  
  score = Math.round(score * difficultyMultiplier)
  
  // Ensure reasonable bounds
  score = Math.max(5, Math.min(85, score))

  const getPerformanceLevel = (s: number) => {
    if (s >= 70) return 'good'
    if (s >= 50) return 'adequate'
    if (s >= 30) return 'basic'
    return 'poor'
  }

  const performanceLevel = getPerformanceLevel(score)

  const result = {
    score,
    feedback: `FALLBACK SCORING: Answer demonstrates ${performanceLevel} effort. ${score < 50 ? 'Consider providing more detailed technical explanations and examples.' : 'Shows understanding but could benefit from more depth.'}`,
    strengths: score >= 50 ? ['Attempted comprehensive answer', 'Shows basic understanding'] : ['Made an effort to respond'],
    improvements: score < 70 ? [
      'Provide more specific technical details',
      'Include concrete examples',
      'Explain reasoning behind choices'
    ] : ['Consider edge cases and optimization']
  }
  
  console.log('📊 Fallback Score Result:', result.score)
  console.log('📝 Fallback Feedback:', result.feedback)
  
  return result
}

function getFallbackSummary(
  candidateName: string,
  answers: Array<{
    question: string
    answer: string
    score: number
    difficulty: string
    timeTaken: number
  }>,
  overallScore: number
): string {
  const avgScore = Math.round(answers.reduce((sum, a) => sum + a.score, 0) / answers.length)
  
  return `${candidateName} completed the technical interview with an overall score of ${overallScore}/100 (average: ${avgScore}/100). 
  
They demonstrated ${overallScore >= 80 ? 'excellent' : overallScore >= 60 ? 'good' : 'developing'} technical knowledge across the assessed areas. Key strengths include problem-solving approach and communication skills. 
  
${overallScore >= 70 ? 'Recommended for further consideration.' : 'Consider additional technical discussion or training opportunities.'}`
}

// Utility function to check if Gemini is configured
export function isGeminiConfigured(): boolean {
  const configured = !!API_KEY && !!genAI
  console.log('🔍 Gemini Configuration Check:')
  console.log('- API_KEY exists:', !!API_KEY)
  console.log('- API_KEY value:', API_KEY ? `${API_KEY.substring(0, 10)}...${API_KEY.substring(API_KEY.length - 5)}` : 'None')
  console.log('- genAI instance:', !!genAI)
  console.log('- Overall configured:', configured)
  return configured
}

// Test function to verify Gemini is working
export async function testGeminiConnection(): Promise<boolean> {
  if (!isGeminiConfigured()) {
    console.log('❌ Gemini not configured')
    return false
  }

  try {
    console.log('🧪 Testing Gemini connection...')
    const model = genAI!.getGenerativeModel({ model: "gemini-pro" })
    const result = await model.generateContent("Say 'Hello' in JSON format: {\"message\": \"Hello\"}")
    const response = await result.response
    const text = response.text()
    console.log('✅ Gemini test successful:', text)
    return true
  } catch (error) {
    console.error('❌ Gemini test failed:', error)
    return false
  }
}

// Export the service status
export const geminiService = {
  isConfigured: isGeminiConfigured(),
  generateQuestions: generateInterviewQuestions,
  scoreAnswer,
  generateSummary: generateInterviewSummary
}