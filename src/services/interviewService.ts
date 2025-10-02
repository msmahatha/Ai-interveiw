import { AppDispatch } from '@/store/store'
import { resetInterview } from '@/store/interviewSlice'

/**
 * Interview management utilities
 */
export class InterviewService {
  /**
   * Start a new interview by resetting all interview state
   * @param dispatch - Redux dispatch function
   * @returns Promise that resolves when the interview is reset
   */
  static async startNewInterview(dispatch: AppDispatch): Promise<void> {
    // Reset all interview state
    dispatch(resetInterview())
    
    // Add a small delay to ensure state is properly reset
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  /**
   * Check if there's an active interview in progress
   * @param state - Current interview state
   * @returns boolean indicating if an interview is active
   */
  static hasActiveInterview(state: {
    candidateId: string | null
    isComplete: boolean
  }): boolean {
    return Boolean(state.candidateId && !state.isComplete)
  }

  /**
   * Check if an interview was completed
   * @param state - Current interview state
   * @returns boolean indicating if an interview is completed
   */
  static isInterviewCompleted(state: {
    candidateId: string | null
    isComplete: boolean
  }): boolean {
    return Boolean(state.candidateId && state.isComplete)
  }
}

export default InterviewService