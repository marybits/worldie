const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const passport = require('passport');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword
    });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.status(201).json({
      token,
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({
      token,
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/auth/google - Initiates Google OAuth login
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

// GET /api/auth/google/callback - Handles Google OAuth callback
router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user, info) => {
    if (err) {
  console.error('Google OAuth error:', err);
  return res.redirect('http://localhost:5173/login');
}
if (!user) {
  console.error('No user returned. Info:', info);
  return res.redirect('http://localhost:5173/login');
}

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.redirect(`http://localhost:5173/oauth-success?token=${token}`);
  })(req, res, next);
});

const protect = require('../middleware/auth');

// GET /api/auth/me - Get current user info 
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ id: user._id, username: user.username, email: user.email });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// PUT /api/auth/username - Update current user's username
router.put('/username', protect, async (req, res) => {
  try {
    const { username } = req.body;

    if (!username || username.trim().length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters' });
    }

    const existingUser = await User.findOne({ username, _id: { $ne: req.userId } });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { username: username.trim() },
      { new: true }
    ).select('-password');

    res.json({ id: user._id, username: user.username, email: user.email });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;