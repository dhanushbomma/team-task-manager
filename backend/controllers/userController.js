// =============================================
// controllers/userController.js
// =============================================

const User = require('../models/User');

// @route  GET /api/users
// @desc   Get all users (Admin only - used when assigning tasks)
// @access Private/Admin
const getAllUsers = async (req, res) => {
  try {
    // Return all users but never return passwords
    const users = await User.find().select('-password').sort({ name: 1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
};

module.exports = { getAllUsers };
