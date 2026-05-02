// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { getAllUsers } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Only admin can list all users (for member assignment dropdown)
router.get('/', protect, adminOnly, getAllUsers);

module.exports = router;
