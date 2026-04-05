import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import StudySession from './pages/StudySession';
import StudyRoom from './pages/StudyRoom';
import Analytics from './pages/Analytics';
import History from './pages/History';
import Login from './pages/Login';
import Register from './pages/Register';
import PrivateRoute from './components/PrivateRoute';
import DataCheck from './pages/DataCheck';


function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-light-bg dark:bg-dark-bg transition-colors duration-300">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/study" element={<PrivateRoute><StudySession /></PrivateRoute>} />
                <Route path="/room" element={<PrivateRoute><StudyRoom /></PrivateRoute>} />
                <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
                <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
                <Route path="/check-data" element={<PrivateRoute><DataCheck /></PrivateRoute>} />
              </Routes>
            </main>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                  borderRadius: '12px',
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;