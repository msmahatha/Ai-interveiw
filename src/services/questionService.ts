import api from './api';

export interface Question {
  _id: string;
  text: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  timeLimit: number;
  expectedAnswer?: string;
  tags: string[];
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  isActive: boolean;
  usage: {
    timesUsed: number;
    averageScore: number;
    successRate: number;
  };
  createdAt: string;
  updatedAt: string;
}

class QuestionService {
  // Get all questions
  async getQuestions(params?: {
    page?: number;
    limit?: number;
    difficulty?: string;
    category?: string;
    tags?: string[];
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ questions: Question[]; pagination: any }> {
    const response = await api.get('/questions', { params });
    return response.data.data;
  }

  // Get random questions for interview
  async getRandomQuestions(params?: {
    count?: number;
    difficulty?: string;
    category?: string;
    excludeIds?: string[];
  }): Promise<Question[]> {
    const response = await api.get('/questions/random', { params });
    return response.data.data.questions;
  }

  // Get question by ID
  async getQuestionById(id: string): Promise<Question> {
    const response = await api.get(`/questions/${id}`);
    return response.data.data.question;
  }

  // Create new question
  async createQuestion(questionData: Partial<Question>): Promise<Question> {
    const response = await api.post('/questions', questionData);
    return response.data.data.question;
  }

  // Update question
  async updateQuestion(id: string, updates: Partial<Question>): Promise<Question> {
    const response = await api.put(`/questions/${id}`, updates);
    return response.data.data.question;
  }

  // Delete question
  async deleteQuestion(id: string): Promise<void> {
    await api.delete(`/questions/${id}`);
  }

  // Update question usage statistics
  async updateQuestionUsage(id: string, usage: { score?: number; success?: boolean }): Promise<Question> {
    const response = await api.post(`/questions/${id}/usage`, usage);
    return response.data.data.question;
  }

  // Get question categories
  async getCategories(): Promise<string[]> {
    const response = await api.get('/questions/meta/categories');
    return response.data.data.categories;
  }

  // Get question tags
  async getTags(): Promise<string[]> {
    const response = await api.get('/questions/meta/tags');
    return response.data.data.tags;
  }

  // Get question statistics
  async getQuestionStats(): Promise<any> {
    const response = await api.get('/questions/stats/overview');
    return response.data.data.stats;
  }
}

export const questionService = new QuestionService();
export default questionService;