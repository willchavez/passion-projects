// models/index.js
import mongoose from 'mongoose';

// User Schema
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: false,
  },
  emailVerified: {
    type: Date,
    default: null,
  },
  image: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Project Schema
const ProjectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  type: {
    type: String,
    enum: ['structured', 'freestyle'],
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Task Schema
const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending',
  },
  isAiGenerated: {
    type: Boolean,
    default: false,
  },
  dueDate: {
    type: Date,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Waitlist Schema
const WaitlistSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  signupDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['pending', 'invited'],
    default: 'pending'
  }
});

// Export models while handling NextJS hot reloading
export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema);
export const Task = mongoose.models.Task || mongoose.model('Task', TaskSchema);
export const Waitlist = mongoose.models.Waitlist || mongoose.model('Waitlist', WaitlistSchema);