import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await axios.get('/api/analytics/history?limit=30');
      setHistory(response.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceColor = (score) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Study History
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Track your progress over time
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* History List */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Sessions
              </h3>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {history.length > 0 ? (
                history.map((session, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    onClick={() => setSelectedDate(selectedDate === index ? null : index)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-primary" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {format(new Date(session.date), 'MMMM d, yyyy')}
                        </span>
                      </div>
                      <div className={`flex items-center space-x-1 ${getPerformanceColor(session.focusScore)}`}>
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm font-medium">{session.focusScore}%</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Study Time</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {Math.floor(session.studyDuration / 60)}h {session.studyDuration % 60}m
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Tasks</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {session.completedTasks}/{session.plannedTasks}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Missed</p>
                        <p className="text-sm font-medium text-red-500">
                          {session.missedTasks}
                        </p>
                      </div>
                    </div>

                    {selectedDate === index && session.tasks?.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                      >
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Task Details:
                        </p>
                        <div className="space-y-2">
                          {session.tasks.map((task, taskIndex) => (
                            <div key={taskIndex} className="flex items-center justify-between text-sm">
                              <div className="flex items-center space-x-2">
                                {task.status === 'completed' ? (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-red-500" />
                                )}
                                <span className="text-gray-700 dark:text-gray-300">{task.title}</span>
                              </div>
                              <span className="text-gray-500">{task.plannedTime} min</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    No study history yet. Start your first session!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-6 sticky top-24"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Summary
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {history.length}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Study Time</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.floor(history.reduce((sum, h) => sum + h.studyDuration, 0) / 60)} hours
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Average Focus Score</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.round(history.reduce((sum, h) => sum + h.focusScore, 0) / history.length) || 0}%
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Task Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {history.length > 0
                    ? Math.round(
                        (history.reduce((sum, h) => sum + h.completedTasks, 0) /
                          history.reduce((sum, h) => sum + h.plannedTasks, 0)) *
                          100
                      )
                    : 0}%
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-white dark:bg-dark-card rounded-xl">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                💡 Consistency is key! Try to study at least 1 hour every day to build a strong habit.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default History;