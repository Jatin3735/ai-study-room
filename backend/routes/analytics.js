import express from 'express';
import StudySession from '../models/StudySession.js';
import StudyPlan from '../models/StudyPlan.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/performance', async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    const now = new Date();
    let startDate;
    
    if (period === 'week') {
      startDate = new Date(now.setDate(now.getDate() - 7));
    } else if (period === 'month') {
      startDate = new Date(now.setMonth(now.getMonth() - 1));
    } else {
      startDate = new Date(now.setDate(now.getDate() - 30));
    }
    
    const sessions = await StudySession.find({
      userId: req.userId,
      date: { $gte: startDate }
    });
    
    const totalHours = sessions.reduce((sum, s) => sum + s.duration, 0) / 60;
    const avgFocusScore = sessions.reduce((sum, s) => sum + s.focusScore, 0) / sessions.length;
    const bestDay = sessions.reduce((best, current) => {
      return current.duration > best.duration ? current : best;
    }, { duration: 0 });
    
    // Daily stats for chart
    const dailyStats = {};
    sessions.forEach(session => {
      const date = session.date.toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = { hours: 0, focusScore: 0, count: 0 };
      }
      dailyStats[date].hours += session.duration / 60;
      dailyStats[date].focusScore += session.focusScore;
      dailyStats[date].count++;
    });
    
    Object.keys(dailyStats).forEach(date => {
      dailyStats[date].focusScore /= dailyStats[date].count;
    });
    
    // Task completion rate
    const plans = await StudyPlan.find({
      userId: req.userId,
      date: { $gte: startDate }
    });
    
    let totalTasks = 0;
    let completedTasks = 0;
    plans.forEach(plan => {
      totalTasks += plan.tasks.length;
      completedTasks += plan.tasks.filter(t => t.status === 'completed').length;
    });
    
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    res.json({
      totalHours,
      avgFocusScore: Math.round(avgFocusScore),
      bestDay: bestDay.date ? {
        date: bestDay.date,
        hours: bestDay.duration / 60
      } : null,
      completionRate,
      dailyStats: Object.entries(dailyStats).map(([date, stats]) => ({ date, ...stats }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/history', async (req, res) => {
  try {
    const { limit = 30 } = req.query;
    const sessions = await StudySession.find({ userId: req.userId })
      .sort({ date: -1 })
      .limit(parseInt(limit));
    
    const history = await Promise.all(sessions.map(async (session) => {
      const plan = await StudyPlan.findOne({
        userId: req.userId,
        date: session.date
      });
      
      const tasks = plan?.tasks || [];
      const completedTasks = tasks.filter(t => t.status === 'completed');
      const missedTasks = tasks.filter(t => t.status === 'pending');
      
      return {
        date: session.date,
        studyDuration: session.duration,
        focusScore: session.focusScore,
        plannedTasks: tasks.length,
        completedTasks: completedTasks.length,
        missedTasks: missedTasks.length,
        tasks: tasks
      };
    }));
    
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;