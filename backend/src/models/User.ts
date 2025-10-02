import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  uid: string; // Firebase UID
  email: string;
  name: string;
  role: 'interviewer' | 'candidate';
  profilePicture?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  preferences?: {
    notifications: boolean;
    emailUpdates: boolean;
    theme: 'light' | 'dark';
  };
}

const UserSchema: Schema = new Schema({
  uid: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['interviewer', 'candidate'],
    default: 'candidate',
  },
  profilePicture: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  preferences: {
    notifications: {
      type: Boolean,
      default: true,
    },
    emailUpdates: {
      type: Boolean,
      default: true,
    },
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light',
    },
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
UserSchema.index({ email: 1 });
UserSchema.index({ uid: 1 });
UserSchema.index({ role: 1 });

export default mongoose.model<IUser>('User', UserSchema);