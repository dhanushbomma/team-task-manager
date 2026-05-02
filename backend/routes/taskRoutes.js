// routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getDashboardStats,
} = require('../controllers/taskController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, getDashboardStats);      // Dashboard stats
router.get('/',          protect, getTasks);               // All users (filtered by role)
router.post('/',         protect, adminOnly, createTask);  // Admin only
router.put('/:id',       protect, updateTask);             // Admin full update; Member status only
router.delete('/:id',    protect, adminOnly, deleteTask);  // Admin only

module.exports = router;
