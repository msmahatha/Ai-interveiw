import mongoose, { Schema, Document } from 'mongoose';

export interface IInterview extends Document {
  candidateId: mongoose.Types.ObjectId;
  interviewerId: mongoose.Types.ObjectId;
  questions: mongoose.Types.ObjectId[];
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  startTime?: Date;
  endTime?: Date;
  duration?: number; // in minutes
  template: string;
  settings: {
    timePerQuestion: number;
    allowSkip: boolean;
    showScore: boolean;
    recordSession: boolean;
  };
  result: {
    totalScore: number;
    passed: boolean;
    feedback: string;
    recommendations: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const InterviewSchema: Schema = new Schema({
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true,
  },
  interviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
  }],
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
    default: 'scheduled',
  },
  startTime: {
    type: Date,
  },
  endTime: {
    type: Date,
  },
  duration: {
    type: Number,
    min: 0,
  },
  template: {
    type: String,
    required: true,
    trim: true,
  },
  settings: {
    timePerQuestion: {
      type: Number,
      default: 300, // 5 minutes default
      min: 30,
      max: 1800,
    },
    allowSkip: {
      type: Boolean,
      default: true,
    },
    showScore: {
      type: Boolean,
      default: false,
    },
    recordSession: {
      type: Boolean,
      default: false,
    },
  },
  result: {
    totalScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    passed: {
      type: Boolean,
      default: false,
    },
    feedback: {
      type: String,
      default: '',
    },
    recommendations: [{
      type: String,
      trim: true,
    }],
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
InterviewSchema.index({ candidateId: 1 });
InterviewSchema.index({ interviewerId: 1 });
InterviewSchema.index({ status: 1 });
InterviewSchema.index({ startTime: 1 });
InterviewSchema.index({ 'result.totalScore': -1 });
InterviewSchema.index({ createdAt: -1 });

// Virtual for calculating duration if not set
InterviewSchema.virtual('calculatedDuration').get(function(this: IInterview) {
  if (this.startTime && this.endTime) {
    return Math.round((this.endTime.getTime() - this.startTime.getTime()) / (1000 * 60));
  }
  return this.duration || 0;
});

export default mongoose.model<IInterview>('Interview', InterviewSchema);