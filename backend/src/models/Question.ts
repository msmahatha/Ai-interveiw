import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion extends Document {
  text: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  timeLimit: number;
  expectedAnswer?: string;
  tags: string[];
  createdBy: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  usage: {
    timesUsed: number;
    averageScore: number;
    successRate: number;
  };
}

const QuestionSchema: Schema = new Schema({
  text: {
    type: String,
    required: true,
    trim: true,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  timeLimit: {
    type: Number,
    required: true,
    min: 30, // minimum 30 seconds
    max: 1800, // maximum 30 minutes
  },
  expectedAnswer: {
    type: String,
    trim: true,
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  usage: {
    timesUsed: {
      type: Number,
      default: 0,
    },
    averageScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    successRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
QuestionSchema.index({ difficulty: 1 });
QuestionSchema.index({ category: 1 });
QuestionSchema.index({ tags: 1 });
QuestionSchema.index({ createdBy: 1 });
QuestionSchema.index({ isActive: 1 });
QuestionSchema.index({ 'usage.averageScore': -1 });

export default mongoose.model<IQuestion>('Question', QuestionSchema);