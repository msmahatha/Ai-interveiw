import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { geminiService, type CandidateProfile } from '@/services/geminiService'

export interface InterviewQuestion {
  id: string
  text: string
  difficulty: 'easy' | 'medium' | 'hard'
  timeLimit: number
  category?: string
}

export interface InterviewAnswer {
  questionId: string
  text: string
  timeTaken: number
}

interface InterviewState {
  candidateId: string | null
  currentQuestion: number
  questions: InterviewQuestion[]
  answers: InterviewAnswer[]
  startTime: string | null
  isPaused: boolean
  isComplete: boolean
  isGeneratingQuestions: boolean
  questionGenerationError: string | null
  // Timer persistence
  currentQuestionStartTime: string | null
  timeSpentOnCurrentQuestion: number
}

const initialQuestions: InterviewQuestion[] = [
  {
    id: '1',
    text: 'Explain the difference between state and props in React. When would you use each?',
    difficulty: 'easy',
    timeLimit: 20
  },
  {
    id: '2',
    text: 'What is the purpose of useEffect hook and how do you handle cleanup?',
    difficulty: 'easy',
    timeLimit: 20
  },
  {
    id: '3',
    text: 'Describe how you would implement a custom hook in React. Give an example.',
    difficulty: 'medium',
    timeLimit: 60
  },
  {
    id: '4',
    text: 'Explain the concept of middleware in Express.js and how you would use it for authentication.',
    difficulty: 'medium',
    timeLimit: 60
  },
  {
    id: '5',
    text: 'Design a scalable REST API for a social media platform. Consider rate limiting, caching, and database design.',
    difficulty: 'hard',
    timeLimit: 120
  },
  {
    id: '6',
    text: 'Explain how you would optimize a React application with performance issues. Include specific techniques and tools.',
    difficulty: 'hard',
    timeLimit: 120
  }
]

// Async thunk for generating questions with Gemini AI
export const generateQuestionsAsync = createAsyncThunk(
  'interview/generateQuestions',
  async (candidateProfile: CandidateProfile) => {
    return await geminiService.generateQuestions(candidateProfile, 6)
  }
)

const initialState: InterviewState = {
  candidateId: null,
  currentQuestion: 0,
  questions: initialQuestions,
  answers: [],
  startTime: null,
  isPaused: false,
  isComplete: false,
  isGeneratingQuestions: false,
  questionGenerationError: null,
  currentQuestionStartTime: null,
  timeSpentOnCurrentQuestion: 0
}

const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    startInterview: (state, action: PayloadAction<{ candidateId: string }>) => {
      state.candidateId = action.payload.candidateId
      state.currentQuestion = 0
      state.answers = []
      state.startTime = new Date().toISOString()
      state.isPaused = false
      state.isComplete = false
      state.currentQuestionStartTime = new Date().toISOString()
      state.timeSpentOnCurrentQuestion = 0
      // Mark session as active when starting new interview
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('interview-session-active', 'true')
      }
    },
    
    nextQuestion: (state) => {
      if (state.currentQuestion < state.questions.length - 1) {
        state.currentQuestion += 1
        state.currentQuestionStartTime = new Date().toISOString()
        state.timeSpentOnCurrentQuestion = 0
      }
    },
    
    previousQuestion: (state) => {
      if (state.currentQuestion > 0) {
        state.currentQuestion -= 1
      }
    },
    
    submitAnswer: (state, action: PayloadAction<{ questionId: string; text: string; timeTaken: number }>) => {
      const { questionId, text, timeTaken } = action.payload
      const existingAnswerIndex = state.answers.findIndex(a => a.questionId === questionId)
      const answer = { questionId, text, timeTaken }
      
      if (existingAnswerIndex >= 0) {
        state.answers[existingAnswerIndex] = answer
      } else {
        state.answers.push(answer)
      }
    },
    
    skipQuestion: (state, action: PayloadAction<{ questionId: string }>) => {
      const { questionId } = action.payload
      const existingAnswerIndex = state.answers.findIndex(a => a.questionId === questionId)
      const answer = { questionId, text: '', timeTaken: 0 }
      
      if (existingAnswerIndex >= 0) {
        state.answers[existingAnswerIndex] = answer
      } else {
        state.answers.push(answer)
      }
    },
    
    pauseInterview: (state) => {
      state.isPaused = true
    },
    
    resumeInterview: (state) => {
      state.isPaused = false
      // Don't automatically resume timer - let the component handle it
    },
    
    completeInterview: (state) => {
      state.isComplete = true
      state.isPaused = false
    },
    
    resetInterview: () => {
      // Clear session storage when resetting
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('interview-session-active')
      }
      return initialState
    },
    
    setQuestions: (state, action: PayloadAction<InterviewQuestion[]>) => {
      state.questions = action.payload
    },
    
    jumpToQuestion: (state, action: PayloadAction<number>) => {
      if (action.payload >= 0 && action.payload < state.questions.length) {
        state.currentQuestion = action.payload
        state.currentQuestionStartTime = new Date().toISOString()
        state.timeSpentOnCurrentQuestion = 0
      }
    },
    
    startQuestionTimer: (state) => {
      // Only set new start time if not already set (prevents double-setting)
      if (!state.currentQuestionStartTime) {
        state.currentQuestionStartTime = new Date().toISOString()
        state.timeSpentOnCurrentQuestion = 0
      }
    },
    
    updateTimeSpent: (state, action: PayloadAction<number>) => {
      state.timeSpentOnCurrentQuestion = action.payload
    },
    
    pauseTimer: (state) => {
      if (state.currentQuestionStartTime) {
        const now = new Date().getTime()
        const startTime = new Date(state.currentQuestionStartTime).getTime()
        const elapsedSinceStart = Math.floor((now - startTime) / 1000)
        state.timeSpentOnCurrentQuestion += elapsedSinceStart
        state.currentQuestionStartTime = null
      }
    },

    resumeTimer: (state) => {
      // Only set new start time if not already set (prevents double-setting)
      if (!state.currentQuestionStartTime) {
        state.currentQuestionStartTime = new Date().toISOString()
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateQuestionsAsync.pending, (state) => {
        state.isGeneratingQuestions = true
        state.questionGenerationError = null
      })
      .addCase(generateQuestionsAsync.fulfilled, (state, action) => {
        state.isGeneratingQuestions = false
        state.questions = action.payload
        state.questionGenerationError = null
      })
      .addCase(generateQuestionsAsync.rejected, (state, action) => {
        state.isGeneratingQuestions = false
        state.questionGenerationError = action.error.message || 'Failed to generate questions'
        // Keep fallback questions on error
      })
  }
})

export const {
  startInterview,
  nextQuestion,
  previousQuestion,
  submitAnswer,
  skipQuestion,
  pauseInterview,
  resumeInterview,
  completeInterview,
  resetInterview,
  setQuestions,
  jumpToQuestion,
  startQuestionTimer,
  updateTimeSpent,
  pauseTimer,
  resumeTimer,
} = interviewSlice.actions

// generateQuestionsAsync is already exported above

export default interviewSlice.reducer