import express from 'express';
import StudyPlan from '../models/StudyPlan.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/today', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let plan = await StudyPlan.findOne({
      userId: req.userId,
      date: today
    });
    
    if (!plan) {
      // Check for incomplete tasks from yesterday
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const yesterdayPlan = await StudyPlan.findOne({
        userId: req.userId,
        date: yesterday
      });
      
      const pendingTasks = yesterdayPlan?.tasks
        .filter(task => task.status === 'pending')
        .map(task => ({
          title: task.title,
          plannedTime: task.plannedTime,
          status: 'pending'
        })) || [];
      
      plan = new StudyPlan({
        userId: req.userId,
        date: today,
        tasks: pendingTasks,
        totalPlannedTime: pendingTasks.reduce((sum, t) => sum + t.plannedTime, 0),
        totalCompletedTime: 0
      });
      
      await plan.save();
    }
    
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/add', async (req, res) => {
  try {
    const { tasks } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let plan = await StudyPlan.findOne({
      userId: req.userId,
      date: today
    });
    
    if (!plan) {
      plan = new StudyPlan({
        userId: req.userId,
        date: today,
        tasks: [],
        totalPlannedTime: 0,
        totalCompletedTime: 0
      });
    }
    
    plan.tasks.push(...tasks);
    plan.totalPlannedTime += tasks.reduce((sum, t) => sum + t.plannedTime, 0);
    await plan.save();
    
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/update/:taskId', async (req, res) => {
  try {
    const { status } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const plan = await StudyPlan.findOne({
      userId: req.userId,
      date: today
    });
    
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    
    const task = plan.tasks.id(req.params.taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    if (status === 'completed' && task.status !== 'completed') {
      plan.totalCompletedTime += task.plannedTime;
      task.completedAt = new Date();
    }
    
    task.status = status;
    await plan.save();
    
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;