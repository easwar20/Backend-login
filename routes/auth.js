const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Validate email
router.post('/validate-unique-email', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    res.json({ isUnique: !user, user: user ? { id: user._id, fullName: user.fullName, email: user.email } : null });
  } catch (error) {
    res.status(500).json({ message: { error: 'Server error' } });
  }
});

// Register user
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: { email: 'User already exists' } });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    user = new User({ fullName, email, password: hashedPassword });
    await user.save();
    
    res.json({ user: { id: user._id, fullName: user.fullName, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: { error: 'Server error' } });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: { email: 'Invalid credentials' } });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: { password: 'Invalid credentials' } });
    }
    res.json({ user: { id: user._id, fullName: user.fullName, email: user.email }});
  } catch (error) {
    res.status(500).json({ message: { error: 'Server error' } });
  }
});

module.exports = router;