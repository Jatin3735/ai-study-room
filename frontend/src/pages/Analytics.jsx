import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, TrendingUp, Target, Award, Clock, Brain, Download } from 'lucide-react';
import axios from 'axios';

const Analytics = () => {
  const [period, setPeriod] = useState('week');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`/api/analytics/performance?period=${period}`);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#4F46E5', '#06B6D4', '#22C55E', '#F59E0B'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Performance Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Track your study progress and insights</p>
        </div>
        
        <div className="flex gap-2">
          {['week', 'month'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg transition-all ${period === p ? 'bg-primary text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
            >
              {p === 'week' ? 'This Week' : 'This Month'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-primary/10 rounded-lg"><Clock className="text-primary" /></div>
            <h3 className="text-sm text-gray-500">Total Hours</h3>
          </div>
          <p className="text-3xl font-bold">{data?.totalHours?.toFixed(1) || 0}h</p>
        </div>

        <div className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-500/10 rounded-lg"><Brain className="text-green-500" /></div>
            <h3 className="text-sm text-gray-500">Focus Score</h3>
          </div>
          <p className="text-3xl font-bold">{data?.avgFocusScore || 0}%</p>
        </div>

        <div className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-orange-500/10 rounded-lg"><Target className="text-orange-500" /></div>
            <h3 className="text-sm text-gray-500">Completion Rate</h3>
          </div>
          <p className="text-3xl font-bold">{data?.completionRate?.toFixed(1) || 0}%</p>
        </div>

        <div className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-500/10 rounded-lg"><Award className="text-purple-500" /></div>
            <h3 className="text-sm text-gray-500">Best Day</h3>
          </div>
          <p className="text-3xl font-bold">{data?.bestDay?.hours?.toFixed(1) || 0}h</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Study Hours Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data?.dailyStats || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="hours" stroke="#4F46E5" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Focus Score Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data?.dailyStats || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="focusScore" stroke="#06B6D4" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-dark-card p-4 rounded-xl">
            <p className="text-sm text-gray-500">Best Performance</p>
            <p className="text-lg font-semibold mt-1">{data?.dailyStats?.length > 0 ? `${Math.max(...data.dailyStats.map(d => d.hours)).toFixed(1)} hrs` : 'N/A'}</p>
          </div>
          <div className="bg-white dark:bg-dark-card p-4 rounded-xl">
            <p className="text-sm text-gray-500">Average Daily</p>
            <p className="text-lg font-semibold mt-1">{data?.dailyStats?.length > 0 ? `${(data.dailyStats.reduce((sum, d) => sum + d.hours, 0) / data.dailyStats.length).toFixed(1)} hrs` : 'N/A'}</p>
          </div>
          <div className="bg-white dark:bg-dark-card p-4 rounded-xl">
            <p className="text-sm text-gray-500">Consistency</p>
            <p className="text-lg font-semibold mt-1">{data?.dailyStats?.length > 0 ? `${Math.round((data.dailyStats.filter(d => d.hours > 0).length / data.dailyStats.length) * 100)}%` : 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;