import express from 'express';
import StudySession from '../models/StudySession.js';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/start', async (req, res) => {
  try {
    // Start session logic
    res.json({ message: 'Session started', sessionId: new Date().getTime() });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/end', async (req, res) => {
  try {
    const { duration, breakTime, focusScore, taskCompleted } = req.body;
    
    const session = new StudySession({
      userId: req.userId,
      duration,
      breakTime,
      focusScore,
      taskCompleted
    });
    
    await session.save();
    
    // Update user streak
    const user = await User.findById(req.userId);
    const today = new Date().toDateString();
    const lastActive = user.lastActive.toDateString();
    
    if (lastActive !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastActive === yesterday.toDateString()) {
        user.streak += 1;
      } else {
        user.streak = 1;
      }
      user.lastActive = new Date();
      await user.save();
    }
    
    res.json({ message: 'Session saved', session });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/history', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const since = new Date();
    since.setDate(since.getDate() - days);
    
    const sessions = await StudySession.find({
      userId: req.userId,
      date: { $gte: since }
    }).sort({ date: -1 });
    
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;