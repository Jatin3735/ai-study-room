import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Coffee, Brain, TrendingUp, Save } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const StudySession = () => {
  const [time, setTime] = useState(1500);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [focusScore, setFocusScore] = useState(100);
  const [sessionStart, setSessionStart] = useState(null);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [currentDuration, setCurrentDuration] = useState(0);
  const timerRef = useRef(null);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    if (!sessionStart) {
      setSessionStart(new Date());
    }
    
    setIsRunning(true);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setTime(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIsRunning(false);
          
          if (!isBreak) {
            toast.success('🎉 Session complete! Time for a break!');
            setTimeout(() => handleBreak(), 1500);
          } else {
            toast.success('✨ Break complete! Ready to study?');
            setTimeout(() => handleBreak(), 1500);
          }
          return 0;
        }
        return prev - 1;
      });
      
      setCurrentDuration(prev => prev + 1);
    }, 1000);
  };

  const pauseTimer = () => {
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const resetTimer = () => {
    pauseTimer();
    if (isBreak) {
      setTime(300);
    } else {
      setTime(1500);
      setFocusScore(100);
      setTabSwitchCount(0);
    }
  };

  const handleBreak = () => {
    pauseTimer();
    setIsBreak(!isBreak);
    setTime(!isBreak ? 300 : 1500);
    if (isBreak) {
      setFocusScore(100);
      setTabSwitchCount(0);
    }
  };

  const saveSession = async () => {
    if (!sessionStart) {
      toast.error('Start a session first!');
      return;
    }

    pauseTimer();
    const duration = Math.floor(currentDuration / 60);
    
    try {
      await axios.post('/api/session/end', {
        duration,
        breakTime: isBreak ? 5 : 0,
        focusScore,
        taskCompleted: ''
      });
      
      toast.success(`✅ Session saved! Focus score: ${focusScore}%`);
      
      setTime(1500);
      setIsBreak(false);
      setFocusScore(100);
      setTabSwitchCount(0);
      setSessionStart(null);
      setCurrentDuration(0);
      setIsRunning(false);
    } catch (error) {
      toast.error('Error saving session');
    }
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isRunning && !isBreak) {
        setTabSwitchCount(prev => prev + 1);
        setFocusScore(prev => Math.max(0, prev - 5));
        toast.warning('⚠️ Stay focused! Tab switching reduces score');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isRunning, isBreak]);

  useEffect(() => {
    let decay;
    if (isRunning && !isBreak) {
      decay = setInterval(() => {
        setFocusScore(prev => Math.max(0, prev - 2));
      }, 60000);
    }
    return () => clearInterval(decay);
  }, [isRunning, isBreak]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Study Session</h1>
        <p className="text-gray-600 dark:text-gray-400">Pomodoro timer with focus tracking</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-dark-card rounded-2xl p-8 shadow-xl">
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
                <Brain className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">{isBreak ? 'Break Time 🍵' : 'Focus Time 🎯'}</span>
              </div>
              
              <div className="text-8xl font-mono font-bold text-gray-900 dark:text-white mb-8 font-mono">
                {formatTime(time)}
              </div>

              <div className="flex justify-center gap-3 flex-wrap">
                {!isRunning ? (
                  <button onClick={startTimer} className="px-8 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2">
                    <Play size={20} /> Start
                  </button>
                ) : (
                  <button onClick={pauseTimer} className="px-8 py-3 bg-yellow-500 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2">
                    <Pause size={20} /> Pause
                  </button>
                )}
                <button onClick={resetTimer} className="px-8 py-3 bg-gray-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2">
                  <RotateCcw size={20} /> Reset
                </button>
                <button onClick={handleBreak} className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2">
                  <Coffee size={20} /> {isBreak ? 'Study' : 'Break'}
                </button>
                {sessionStart && (
                  <button onClick={saveSession} className="px-8 py-3 bg-green-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2">
                    <Save size={20} /> Save
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        <div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="text-primary" /> Session Stats
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-2">Focus Score</p>
                <div className="flex justify-between mb-1">
                  <span className="text-2xl font-bold">{focusScore}%</span>
                  <span className="text-sm">{focusScore >= 80 ? 'Excellent!' : focusScore >= 60 ? 'Good' : 'Needs work'}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-secondary transition-all" style={{ width: `${focusScore}%` }} />
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Tab Switches</p>
                <p className="text-2xl font-bold">{tabSwitchCount}</p>
              </div>

              {sessionStart && (
                <div>
                  <p className="text-sm text-gray-500">Current Session</p>
                  <p className="text-2xl font-bold">{Math.floor(currentDuration / 60)} min</p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="text-lg font-semibold">{isRunning ? '⏵ Studying' : '⏸ Paused'}</p>
              </div>
            </div>

            <div className="mt-6 p-3 bg-primary/5 rounded-lg">
              <p className="text-xs">💡 Tip: Stay on this tab for best focus score!</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default StudySession;