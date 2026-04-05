import mongoose from 'mongoose';

const studySessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  duration: {
    type: Number,
    required: true // in minutes
  },
  breakTime: {
    type: Number,
    default: 0
  },
  focusScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },
  taskCompleted: {
    type: String,
    default: ''
  }
});

export default mongoose.model('StudySession', studySessionSchema);