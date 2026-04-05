import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DataCheck = () => {
  const [sessions, setSessions] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    checkData();
  }, []);

  const checkData = async () => {
    try {
      const sessionsRes = await axios.get('/api/session/history');
      const tasksRes = await axios.get('/api/plan/today');
      setSessions(sessionsRes.data);
      setTasks(tasksRes.data.tasks || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Your Saved Data</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Study Sessions: {sessions.length}</h2>
        {sessions.map((s, i) => (
          <div key={i} className="bg-gray-100 dark:bg-gray-800 p-3 rounded mb-2">
            Date: {new Date(s.date).toLocaleDateString()} | 
            Duration: {s.duration} mins | 
            Focus: {s.focusScore}%
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Tasks: {tasks.length}</h2>
        {tasks.map((t, i) => (
          <div key={i} className="bg-gray-100 dark:bg-gray-800 p-3 rounded mb-2">
            {t.title} - {t.plannedTime} mins - Status: {t.status}
          </div>
        ))}
      </div>

      <button 
        onClick={checkData}
        className="mt-4 bg-primary text-white px-4 py-2 rounded"
      >
        Refresh Data
      </button>
    </div>
  );
};

export default DataCheck;