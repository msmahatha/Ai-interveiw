import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid'

export interface Answer {
  question: string
  answer: string
  score: number
  timeTaken: number
  timeAllowed: number
  difficulty: string
}

export interface Candidate {
  id: string
  name: string
  email: string
  phone: string
  score: number
  summary: string
  status: 'completed' | 'in_progress'
  answers: Answer[]
  interviewDate: string
  interviewStartTime: string
  interviewEndTime?: string
}

interface CandidatesState {
  byId: { [key: string]: Candidate }
  allIds: string[]
}

const initialState: CandidatesState = {
  byId: {},
  allIds: []
}

const candidatesSlice = createSlice({
  name: 'candidates',
  initialState,
  reducers: {
    addCandidate: (state, action: PayloadAction<Omit<Candidate, 'score' | 'summary' | 'status' | 'answers' | 'interviewDate' | 'interviewStartTime'> & { id?: string }>) => {
      const id = action.payload.id || uuidv4()
      const candidate: Candidate = {
        ...action.payload,
        id,
        score: 0,
        summary: '',
        status: 'in_progress',
        answers: [],
        interviewDate: new Date().toISOString(),
        interviewStartTime: new Date().toISOString(),
      }
      state.byId[id] = candidate
      state.allIds.push(id)
    },
    
    updateCandidate: (state, action: PayloadAction<{ id: string; updates: Partial<Candidate> }>) => {
      const { id, updates } = action.payload
      if (state.byId[id]) {
        state.byId[id] = { ...state.byId[id], ...updates }
      }
    },
    
    completeInterview: (state, action: PayloadAction<{ id: string; score: number; summary: string; answers: Answer[] }>) => {
      const { id, score, summary, answers } = action.payload
      if (state.byId[id]) {
        state.byId[id] = {
          ...state.byId[id],
          score,
          summary,
          answers,
          status: 'completed',
          interviewEndTime: new Date().toISOString(),
        }
      }
    },
    
    addAnswer: (state, action: PayloadAction<{ candidateId: string; answer: Answer }>) => {
      const { candidateId, answer } = action.payload
      if (state.byId[candidateId]) {
        state.byId[candidateId].answers.push(answer)
      }
    },
    
    deleteCandidate: (state, action: PayloadAction<string>) => {
      const id = action.payload
      delete state.byId[id]
      state.allIds = state.allIds.filter(candidateId => candidateId !== id)
    },
  }
})

export const {
  addCandidate,
  updateCandidate,
  completeInterview,
  addAnswer,
  deleteCandidate,
} = candidatesSlice.actions

export default candidatesSlice.reducer