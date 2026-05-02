// routes/projectRoutes.js
const express = require('express');
const router = express.Router();
const {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/',     protect, getProjects);               // All users can view their projects
router.post('/',    protect, adminOnly, createProject);   // Admin only
router.get('/:id',  protect, getProjectById);             // All users
router.put('/:id',  protect, adminOnly, updateProject);   // Admin only
router.delete('/:id', protect, adminOnly, deleteProject); // Admin only

module.exports = router;
