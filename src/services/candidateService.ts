import api from './api';

export interface Candidate {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  position: string;
  experience: number;
  resumeUrl?: string;
  score: number;
  status: 'pending' | 'in-progress' | 'completed' | 'rejected';
  answers: Answer[];
  summary: string;
  interviewerId?: string;
  interviewDate: string;
  skills: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Answer {
  question: string;
  answer: string;
  score: number;
  timeTaken: number;
  timeAllowed: number;
  difficulty: 'easy' | 'medium' | 'hard';
  feedback?: string;
}

class CandidateService {
  // Get all candidates
  async getCandidates(params?: {
    page?: number;
    limit?: number;
    status?: string;
    position?: string;
    minScore?: number;
    maxScore?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ candidates: Candidate[]; pagination: any }> {
    const response = await api.get('/candidates', { params });
    return response.data.data;
  }

  // Get candidate by ID
  async getCandidateById(id: string): Promise<Candidate> {
    const response = await api.get(`/candidates/${id}`);
    return response.data.data.candidate;
  }

  // Create new candidate
  async createCandidate(candidateData: Partial<Candidate>): Promise<Candidate> {
    const response = await api.post('/candidates', candidateData);
    return response.data.data.candidate;
  }

  // Update candidate
  async updateCandidate(id: string, updates: Partial<Candidate>): Promise<Candidate> {
    const response = await api.put(`/candidates/${id}`, updates);
    return response.data.data.candidate;
  }

  // Delete candidate
  async deleteCandidate(id: string): Promise<void> {
    await api.delete(`/candidates/${id}`);
  }

  // Add answer to candidate
  async addAnswer(candidateId: string, answer: Partial<Answer>): Promise<Candidate> {
    const response = await api.post(`/candidates/${candidateId}/answers`, answer);
    return response.data.data.candidate;
  }

  // Get candidate statistics
  async getCandidateStats(): Promise<any> {
    const response = await api.get('/candidates/stats/overview');
    return response.data.data.stats;
  }
}

export const candidateService = new CandidateService();
export default candidateService;