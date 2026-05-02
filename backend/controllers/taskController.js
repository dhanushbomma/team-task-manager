// =============================================
// controllers/taskController.js
// =============================================

const Task = require('../models/Task');
const Project = require('../models/Project');

// @route  GET /api/tasks
// @desc   Get tasks (Admin: all tasks; Member: only assigned tasks)
// @access Private
const getTasks = async (req, res) => {
  try {
    let tasks;
    const { projectId } = req.query;

    if (req.user.role === 'admin') {
      // Admin can filter by project or see all
      const filter = projectId ? { project: projectId } : {};
      tasks = await Task.find(filter)
        .populate('project', 'name')
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 });
    } else {
      // Members only see tasks assigned to them
      const filter = { assignedTo: req.user._id };
      if (projectId) filter.project = projectId;
      tasks = await Task.find(filter)
        .populate('project', 'name')
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 });
    }

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tasks', error: error.message });
  }
};

// @route  POST /api/tasks
// @desc   Create a task under a project (Admin only)
// @access Private/Admin
const createTask = async (req, res) => {
  try {
    const { title, description, projectId, assignedTo, status, dueDate } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ message: 'Title and projectId are required' });
    }

    // Make sure the project actually exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const task = await Task.create({
      title,
      description,
      project: projectId,
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
      status: status || 'To Do',
      dueDate: dueDate || null,
    });

    await task.populate('project', 'name');
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create task', error: error.message });
  }
};

// @route  PUT /api/tasks/:id
// @desc   Update a task (Admin: full update; Member: status only for their tasks)
// @access Private
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.user.role === 'admin') {
      // Admin can update everything
      const { title, description, assignedTo, status, dueDate } = req.body;
      task.title = title || task.title;
      task.description = description !== undefined ? description : task.description;
      task.assignedTo = assignedTo !== undefined ? assignedTo : task.assignedTo;
      task.status = status || task.status;
      task.dueDate = dueDate !== undefined ? dueDate : task.dueDate;
    } else {
      // Members can only update the status of their own tasks
      if (!task.assignedTo || !task.assignedTo.equals(req.user._id)) {
        return res.status(403).json({ message: 'You can only update tasks assigned to you' });
      }
      if (req.body.status) {
        task.status = req.body.status;
      }
    }

    await task.save();
    await task.populate('project', 'name');
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update task', error: error.message });
  }
};

// @route  DELETE /api/tasks/:id
// @desc   Delete a task (Admin only)
// @access Private/Admin
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await task.deleteOne();
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete task', error: error.message });
  }
};

// @route  GET /api/tasks/dashboard
// @desc   Get dashboard stats for logged-in user
// @access Private
const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();

    // For admin, show all tasks; for member, show only assigned tasks
    const filter = req.user.role === 'admin' ? {} : { assignedTo: req.user._id };

    const allTasks = await Task.find(filter)
      .populate('project', 'name')
      .populate('assignedTo', 'name email');

    // Count tasks by status
    const todo    = allTasks.filter(t => t.status === 'To Do').length;
    const inProg  = allTasks.filter(t => t.status === 'In Progress').length;
    const done    = allTasks.filter(t => t.status === 'Done').length;

    // Overdue = has a due date, not done, and due date is in the past
    const overdue = allTasks.filter(t =>
      t.dueDate && t.status !== 'Done' && new Date(t.dueDate) < today
    );

    res.json({
      total: allTasks.length,
      todo,
      inProgress: inProg,
      done,
      overdueTasks: overdue,
      recentTasks: allTasks.slice(0, 5), // Last 5 tasks
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch dashboard stats', error: error.message });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask, getDashboardStats };
