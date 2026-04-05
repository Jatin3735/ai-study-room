import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Target, 
  Flame, 
  Clock, 
  TrendingUp,
  Play,
  Plus,
  Sparkles,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    todayHours: 0,
    progress: 0,
    streak: 0,
    completionRate: 0
  });
  const [todayTasks, setTodayTasks] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchAiInsights();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Get today's plan
      const planRes = await axios.get('/api/plan/today');
      const tasks = planRes.data.tasks || [];
      setTodayTasks(tasks);
      
      // Get analytics
      const analyticsRes = await axios.get('/api/analytics/performance?period=week');
      const data = analyticsRes.data;
      
      // Calculate today's hours from sessions
      const todaySession = await axios.get('/api/session/history?days=1');
      const todayHours = todaySession.data.reduce((sum, s) => sum + (s.duration / 60), 0);
      
      const progress = (todayHours / (user?.dailyGoal || 4)) * 100;
      const completedTasks = tasks.filter(t => t.status === 'completed').length;
      const completionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;
      
      setStats({
        todayHours: todayHours.toFixed(1),
        progress: Math.min(progress, 100),
        streak: user?.streak || 0,
        completionRate: completionRate.toFixed(1)
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAiInsights = async () => {
    try {
      const response = await axios.get('/api/ai/insights');
      setAiInsights(response.data.insights?.slice(0, 3) || [
        "🎯 Complete your daily tasks to build momentum",
        "📚 Regular short sessions are more effective",
        "💡 Take breaks every 25 minutes for better focus"
      ]);
    } catch (error) {
      console.error('Error fetching AI insights:', error);
    }
  };

  const updateTaskStatus = async (taskId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
      await axios.put(`/api/plan/update/${taskId}`, { status: newStatus });
      toast.success(`Task marked as ${newStatus}!`);
      fetchDashboardData(); // Refresh data
    } catch (error) {
      toast.error('Error updating task');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Ready to achieve your study goals today?
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Clock className="w-6 h-6 text-primary" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.todayHours} hrs
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
            of {user?.dailyGoal} hrs goal
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-500/10 rounded-xl">
              <Flame className="w-6 h-6 text-orange-500" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.streak} days
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
            Current streak 🔥
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500/10 rounded-xl">
              <Target className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.progress}%
          </h3>
          <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
              style={{ width: `${stats.progress}%` }}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500/10 rounded-xl">
              <TrendingUp className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.completionRate}%
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
            Task completion
          </p>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/study')}
          className="gradient-border group cursor-pointer"
        >
          <div className="p-6 text-left">
            <div className="flex items-center justify-between mb-4">
              <Play className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Start Study Session
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Begin focused study with Pomodoro timer
            </p>
          </div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => {
            const title = prompt('Enter task name:');
            if (title) {
              const plannedTime = prompt('Enter planned time (minutes):');
              if (plannedTime) {
                axios.post('/api/plan/add', {
                  tasks: [{ title, plannedTime: parseInt(plannedTime), status: 'pending' }]
                }).then(() => {
                  toast.success('Task added!');
                  fetchDashboardData();
                }).catch(() => toast.error('Error adding task'));
              }
            }
          }}
          className="gradient-border group cursor-pointer"
        >
          <div className="p-6 text-left">
            <div className="flex items-center justify-between mb-4">
              <Plus className="w-8 h-8 text-secondary" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Add Task
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Plan your study tasks for better organization
            </p>
          </div>
        </motion.button>
      </div>

      {/* Today's Tasks & AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-lg"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Today's Tasks
          </h3>
          <div className="space-y-3">
            {todayTasks.length > 0 ? (
              todayTasks.map((task, index) => (
                <div 
                  key={task._id || index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                  onClick={() => updateTaskStatus(task._id, task.status)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${task.status === 'completed' ? 'bg-green-500 border-green-500' : 'border-primary'}`}>
                      {task.status === 'completed' && <CheckCircle className="w-4 h-4 text-white" />}
                    </div>
                    <div>
                      <p className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                        {task.title}
                      </p>
                      <p className="text-sm text-gray-500">{task.plannedTime} minutes</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  No tasks for today. Click "Add Task" to get started!
                </p>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-6"
        >
          <div className="flex items-center space-x-2 mb-4">
            <Sparkles className="w-6 h-6 text-primary" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI Insights
            </h3>
          </div>
          <div className="space-y-3">
            {aiInsights.map((insight, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-white dark:bg-dark-card rounded-lg">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <p className="text-gray-700 dark:text-gray-300 text-sm">{insight}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;