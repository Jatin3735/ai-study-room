import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  plannedTime: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['completed', 'pending'],
    default: 'pending'
  },
  completedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const studyPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  tasks: [taskSchema],
  totalPlannedTime: {
    type: Number,
    default: 0
  },
  totalCompletedTime: {
    type: Number,
    default: 0
  }
});

export default mongoose.model('StudyPlan', studyPlanSchema);