import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { motion } from 'framer-motion';
import { Users, Copy, LogOut, Play, Pause, RotateCcw, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

const StudyRoom = () => {
  const [roomId, setRoomId] = useState('');
  const [joined, setJoined] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [time, setTime] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [userName, setUserName] = useState('');
  const socketRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const storedName = localStorage.getItem('studyRoomName');
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  const joinRoom = () => {
    if (!roomId.trim()) {
      toast.error('Please enter a room ID');
      return;
    }
    if (!userName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    localStorage.setItem('studyRoomName', userName);
    
    socketRef.current = io();
    
    socketRef.current.emit('join-room', { roomId, userName });
    
    socketRef.current.on('room-update', ({ participants: updatedParticipants }) => {
      setParticipants(updatedParticipants);
    });
    
    socketRef.current.on('timer-update', ({ time: updatedTime, isRunning: updatedIsRunning }) => {
      setTime(updatedTime);
      setIsRunning(updatedIsRunning);
    });
    
    setJoined(true);
    toast.success(`Joined room: ${roomId}`);
  };

  const leaveRoom = () => {
    if (socketRef.current) {
      socketRef.current.emit('leave-room', { roomId });
      socketRef.current.disconnect();
    }
    setJoined(false);
    setParticipants([]);
    setTime(25 * 60);
    setIsRunning(false);
    toast.success('Left the room');
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    socketRef.current.emit('timer-sync', { roomId, time, isRunning: true });
    setIsRunning(true);
    
    timerRef.current = setInterval(() => {
      setTime(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          socketRef.current.emit('timer-sync', { roomId, time: 0, isRunning: false });
          toast.success('Timer completed! Great job! 🎉');
          return 0;
        }
        const newTime = prev - 1;
        socketRef.current.emit('timer-sync', { roomId, time: newTime, isRunning: true });
        return newTime;
      });
    }, 1000);
  };

  const pauseTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    socketRef.current.emit('timer-sync', { roomId, time, isRunning: false });
    setIsRunning(false);
  };

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTime(25 * 60);
    socketRef.current.emit('timer-sync', { roomId, time: 25 * 60, isRunning: false });
    setIsRunning(false);
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    toast.success('Room ID copied to clipboard!');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!joined) {
    return (
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-dark-card rounded-2xl p-8 shadow-xl"
        >
          <div className="text-center mb-6">
            <div className="inline-flex p-3 bg-primary/10 rounded-full mb-4">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Join Study Room
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Study together with friends
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Room ID
              </label>
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter room ID"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <button
              onClick={joinRoom}
              className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
            >
              Join Room
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-dark-card text-gray-500">or</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Create New Room
              </label>
              <input
                type="text"
                placeholder="Enter custom room ID"
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Timer Section */}
      <div className="lg:col-span-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-dark-card rounded-2xl p-8 shadow-xl"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Room: {roomId}
              </span>
            </div>
            
            <div className="text-7xl font-mono font-bold text-gray-900 dark:text-white mb-8">
              {formatTime(time)}
            </div>

            <div className="flex justify-center space-x-4">
              {!isRunning ? (
                <button
                  onClick={startTimer}
                  className="px-8 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
                >
                  <Play className="w-5 h-5" />
                  <span>Start</span>
                </button>
              ) : (
                <button
                  onClick={pauseTimer}
                  className="px-8 py-3 bg-yellow-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
                >
                  <Pause className="w-5 h-5" />
                  <span>Pause</span>
                </button>
              )}
              <button
                onClick={resetTimer}
                className="px-8 py-3 bg-gray-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Reset</span>
              </button>
              <button
                onClick={copyRoomId}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
              >
                <Copy className="w-5 h-5" />
                <span>Share</span>
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <button
              onClick={leaveRoom}
              className="w-full py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-300 font-semibold flex items-center justify-center space-x-2"
            >
              <LogOut className="w-5 h-5" />
              <span>Leave Room</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Participants Section */}
      <div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Participants
            </h3>
            <div className="flex items-center space-x-1 text-primary">
              <UserPlus className="w-4 h-4" />
              <span className="text-sm">{participants.length}</span>
            </div>
          </div>

          <div className="space-y-3">
            {participants.map((participant, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-900 dark:text-white">
                  {participant.userName}
                </span>
                {participant.userName === userName && (
                  <span className="text-xs text-primary ml-auto">(You)</span>
                )}
              </div>
            ))}
            {participants.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                No other participants yet
              </p>
            )}
          </div>

          <div className="mt-6 p-4 bg-primary/5 rounded-xl">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              💡 Share the room ID with friends to study together!
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StudyRoom;