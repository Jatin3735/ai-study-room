import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.js';
import sessionRoutes from './routes/sessions.js';
import planRoutes from './routes/planner.js';
import analyticsRoutes from './routes/analytics.js';
import aiRoutes from './routes/ai.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/studyroom';

console.log('📡 Connecting to MongoDB...');

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/plan', planRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Socket.io for study rooms
const rooms = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', ({ roomId, userName }) => {
    socket.join(roomId);
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Map());
    }
    rooms.get(roomId).set(socket.id, { userName, isActive: true });
    
    io.to(roomId).emit('room-update', {
      participants: Array.from(rooms.get(roomId).values())
    });
  });

  socket.on('timer-sync', ({ roomId, time, isRunning }) => {
    socket.to(roomId).emit('timer-update', { time, isRunning });
  });

  socket.on('leave-room', ({ roomId }) => {
    socket.leave(roomId);
    if (rooms.has(roomId)) {
      rooms.get(roomId).delete(socket.id);
      if (rooms.get(roomId).size === 0) {
        rooms.delete(roomId);
      } else {
        io.to(roomId).emit('room-update', {
          participants: Array.from(rooms.get(roomId).values())
        });
      }
    }
  });

  socket.on('disconnect', () => {
    rooms.forEach((participants, roomId) => {
      if (participants.has(socket.id)) {
        participants.delete(socket.id);
        io.to(roomId).emit('room-update', {
          participants: Array.from(participants.values())
        });
      }
    });
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API test: http://localhost:${PORT}/api/test`);
});