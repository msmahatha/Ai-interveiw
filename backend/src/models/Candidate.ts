import mongoose, { Schema, Document } from 'mongoose';

export interface IAnswer {
  question: string;
  answer: string;
  score: number;
  timeTaken: number;
  timeAllowed: number;
  difficulty: 'easy' | 'medium' | 'hard';
  feedback?: string;
}

export interface ICandidate extends Document {
  name: string;
  email: string;
  phone?: string;
  position: string;
  experience: number;
  resumeUrl?: string;
  score: number;
  status: 'pending' | 'in-progress' | 'completed' | 'rejected';
  answers: IAnswer[];
  summary: string;
  interviewerId?: mongoose.Types.ObjectId;
  interviewDate: Date;
  createdAt: Date;
  updatedAt: Date;
  skills: string[];
  notes?: string;
}

const AnswerSchema: Schema = new Schema({
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  timeTaken: {
    type: Number,
    required: true,
    min: 0,
  },
  timeAllowed: {
    type: Number,
    required: true,
    min: 0,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true,
  },
  feedback: {
    type: String,
  },
});

const CandidateSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  position: {
    type: String,
    required: true,
    trim: true,
  },
  experience: {
    type: Number,
    required: true,
    min: 0,
  },
  resumeUrl: {
    type: String,
  },
  score: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'rejected'],
    default: 'pending',
  },
  answers: [AnswerSchema],
  summary: {
    type: String,
    default: '',
  },
  interviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  interviewDate: {
    type: Date,
    default: Date.now,
  },
  skills: [{
    type: String,
    trim: true,
  }],
  notes: {
    type: String,
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
CandidateSchema.index({ email: 1 });
CandidateSchema.index({ status: 1 });
CandidateSchema.index({ interviewerId: 1 });
CandidateSchema.index({ position: 1 });
CandidateSchema.index({ score: -1 });
CandidateSchema.index({ createdAt: -1 });

export default mongoose.model<ICandidate>('Candidate', CandidateSchema);