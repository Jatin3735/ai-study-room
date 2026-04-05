import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Auth route working' });
});

// Register
router.post('/register', async (req, res) => {
  console.log('📝 Register request received:', req.body);
  
  try {
    const { name, email, password } = req.body;
    
    // Validation
    if (!name || !email || !password) {
      console.log('❌ Missing fields');
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    if (password.length < 6) {
      console.log('❌ Password too short');
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new user
    const user = new User({ 
      name: name.trim(), 
      email: email.toLowerCase(), 
      password 
    });
    
    await user.save();
    console.log('✅ User created successfully:', user._id);
    
    // Create token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'mysecretkey',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        dailyGoal: user.dailyGoal,
        streak: user.streak
      }
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  console.log('🔐 Login request received:', req.body.email);
  
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    user.lastActive = new Date();
    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'mysecretkey',
      { expiresIn: '7d' }
    );

    console.log('✅ Login successful:', email);
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        dailyGoal: user.dailyGoal,
        streak: user.streak
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Debug - see all users
router.get('/debug-users', async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json({ count: users.length, users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear all users
router.delete('/clear-users', async (req, res) => {
  try {
    await User.deleteMany({});
    res.json({ message: 'All users deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;