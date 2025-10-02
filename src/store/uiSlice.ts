import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  activeTab: 'interviewee' | 'interviewer'
  selectedCandidateId: string | null
  isWelcomeBackModalOpen: boolean
  searchQuery: string
  scoreFilter: { min: number; max: number } | null
  dateFilter: { start: string; end: string } | null
  sortBy: 'score' | 'date' | 'name'
  sortOrder: 'asc' | 'desc'
}

const initialState: UIState = {
  activeTab: 'interviewee',
  selectedCandidateId: null,
  isWelcomeBackModalOpen: false,
  searchQuery: '',
  scoreFilter: null,
  dateFilter: null,
  sortBy: 'date',
  sortOrder: 'desc'
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<'interviewee' | 'interviewer'>) => {
      state.activeTab = action.payload
    },
    
    setSelectedCandidateId: (state, action: PayloadAction<string | null>) => {
      state.selectedCandidateId = action.payload
    },
    
    setWelcomeBackModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isWelcomeBackModalOpen = action.payload
    },
    
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
    },
    
    setScoreFilter: (state, action: PayloadAction<{ min: number; max: number } | null>) => {
      state.scoreFilter = action.payload
    },
    
    setDateFilter: (state, action: PayloadAction<{ start: string; end: string } | null>) => {
      state.dateFilter = action.payload
    },
    
    setSortBy: (state, action: PayloadAction<'score' | 'date' | 'name'>) => {
      state.sortBy = action.payload
    },
    
    setSortOrder: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.sortOrder = action.payload
    },
    
    toggleSortOrder: (state) => {
      state.sortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc'
    },
    
    resetFilters: (state) => {
      state.searchQuery = ''
      state.scoreFilter = null
      state.dateFilter = null
    }
  }
})

export const {
  setActiveTab,
  setSelectedCandidateId,
  setWelcomeBackModalOpen,
  setSearchQuery,
  setScoreFilter,
  setDateFilter,
  setSortBy,
  setSortOrder,
  toggleSortOrder,
  resetFilters,
} = uiSlice.actions

export default uiSlice.reducer