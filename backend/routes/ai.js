import express from 'express';
import StudySession from '../models/StudySession.js';
import StudyPlan from '../models/StudyPlan.js';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware);

// Try to import OpenAI, but don't fail if key is missing
let OpenAI;
try {
  const openaiModule = await import('openai');
  OpenAI = openaiModule.default;
} catch (error) {
  console.log('OpenAI package not available');
}

// Initialize OpenAI only if API key exists
let openai;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'dummy-key-for-now') {
  try {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    console.log('✅ OpenAI initialized');
  } catch (error) {
    console.log('⚠️ OpenAI initialization failed, using fallback responses');
  }
} else {
  console.log('⚠️ OpenAI API key not set, using fallback responses');
}

router.get('/insights', async (req, res) => {
  try {
    // Get user data for analysis
    const sessions = await StudySession.find({ userId: req.userId })
      .sort({ date: -1 })
      .limit(30);
    
    const user = await User.findById(req.userId);
    const plans = await StudyPlan.find({ userId: req.userId })
      .sort({ date: -1 })
      .limit(30);
    
    // If OpenAI is not available, return fallback insights
    if (!openai) {
      return res.json({
        insights: [
          "🎯 You're making great progress! Consistency is key to success.",
          "📚 Regular study sessions improve long-term retention by up to 50%.",
          "💡 Taking short breaks between sessions helps maintain focus.",
          "🌟 Every study session brings you closer to your goals!"
        ],
        suggestions: [
          "Try to study at the same time each day to build a habit",
          "Break large tasks into 25-minute Pomodoro sessions",
          "Review your progress weekly to stay motivated",
          "Create a distraction-free study environment"
        ]
      });
    }
    
    // Prepare data for AI
    const averageSessionLength = sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length || 0;
    const completionRate = plans.reduce((sum, p) => {
      const completed = p.tasks.filter(t => t.status === 'completed').length;
      return sum + (completed / (p.tasks.length || 1));
    }, 0) / (plans.length || 1);
    
    const prompt = `
      Analyze this student's study data and provide insights:
      
      - Total study sessions: ${sessions.length}
      - Average session length: ${Math.round(averageSessionLength)} minutes
      - Task completion rate: ${Math.round(completionRate * 100)}%
      - Daily goal: ${user.dailyGoal} hours
      - Current streak: ${user.streak} days
      
      Provide 3-4 key insights about their productivity patterns and 2-3 actionable suggestions for improvement.
      Format as JSON with keys: insights (array), suggestions (array).
    `;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });
    
    const aiResponse = JSON.parse(completion.choices[0].message.content);
    res.json(aiResponse);
  } catch (error) {
    console.error('AI error:', error);
    // Fallback insights if AI fails
    res.json({
      insights: [
        "📊 Consistency is building your study habit!",
        "🎯 Your focus improves with regular breaks",
        "💪 Every session is a step toward mastery",
        "🌟 Keep up the great momentum!"
      ],
      suggestions: [
        "Set specific goals for each study session",
        "Use active recall techniques while studying",
        "Create a dedicated study space",
        "Track your progress weekly"
      ]
    });
  }
});

router.post('/recommendations', async (req, res) => {
  try {
    const { currentTask, availableTime } = req.body;
    
    // If OpenAI is not available, return fallback recommendations
    if (!openai) {
      return res.json({
        recommendedTask: currentTask || "Review recent material",
        timeAllocation: [
          { activity: "Review key concepts", minutes: Math.floor(availableTime * 0.4) || 25 },
          { activity: "Practice problems", minutes: Math.floor(availableTime * 0.4) || 25 },
          { activity: "Take short break", minutes: Math.floor(availableTime * 0.2) || 10 }
        ],
        tips: [
          "Start with the most challenging topic",
          "Use active recall techniques",
          "Take notes while studying"
        ]
      });
    }
    
    const sessions = await StudySession.find({ userId: req.userId })
      .sort({ date: -1 })
      .limit(20);
    
    const avgFocusTime = sessions.reduce((sum, s) => sum + s.duration, 0) / (sessions.length || 1);
    
    const prompt = `
      Based on:
      - Current task: ${currentTask}
      - Available time: ${availableTime} minutes
      - Average study session length: ${Math.round(avgFocusTime)} minutes
      
      Recommend what to study next and provide a time-optimized plan.
      Return as JSON with: recommendedTask, timeAllocation (array of {activity, minutes}), tips (array).
    `;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });
    
    const recommendations = JSON.parse(completion.choices[0].message.content);
    res.json(recommendations);
  } catch (error) {
    res.json({
      recommendedTask: "Review recent material",
      timeAllocation: [
        { activity: "Review notes", minutes: Math.floor(availableTime * 0.4) || 25 },
        { activity: "Practice problems", minutes: Math.floor(availableTime * 0.4) || 25 },
        { activity: "Take short break", minutes: Math.floor(availableTime * 0.2) || 10 }
      ],
      tips: ["Start with the most challenging topic", "Use active recall techniques"]
    });
  }
});

export default router;