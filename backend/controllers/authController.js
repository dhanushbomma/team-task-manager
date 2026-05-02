// =============================================
// controllers/authController.js - Signup & Login
// =============================================

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate a JWT token for a given user ID
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d', // Token expires in 7 days
  });
};

// @route  POST /api/auth/signup
// @desc   Register a new user
// @access Public
const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if a user already exists with that email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create the new user (password hashing happens in the model pre-save hook)
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'member', // Default to member if no role specified
    });

    // Return user info + token
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: 'Signup failed', error: error.message });
  }
};

// @route  POST /api/auth/login
// @desc   Authenticate user and get token
// @access Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check if the entered password matches the hashed password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Return user info + token
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

// @route  GET /api/auth/me
// @desc   Get logged-in user's profile
// @access Private
const getMe = async (req, res) => {
  res.json(req.user); // req.user is set by the protect middleware
};

module.exports = { signup, login, getMe };
