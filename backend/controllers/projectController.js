// =============================================
// controllers/projectController.js
// =============================================

const Project = require('../models/Project');
const Task = require('../models/Task');

// @route  GET /api/projects
// @desc   Get all projects (Admin: all, Member: only theirs)
// @access Private
const getProjects = async (req, res) => {
  try {
    let projects;
    if (req.user.role === 'admin') {
      
      projects = await Project.find()
        .populate('createdBy', 'name email')
        .populate('members', 'name email');
    } else {
      // Members only see projects they're part of
      projects = await Project.find({ members: req.user._id })
        .populate('createdBy', 'name email')
        .populate('members', 'name email');
    }
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch projects', error: error.message });
  }
};

// @route  POST /api/projects
// @desc   Create a new project (Admin only)
// @access Private/Admin
const createProject = async (req, res) => {
  try {
    const { name, description, members } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    const project = await Project.create({
      name,
      description,
      createdBy: req.user._id,
      members: members || [],
    });

    
    await project.populate('createdBy', 'name email');
    await project.populate('members', 'name email');

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create project', error: error.message });
  }
};

// @route  GET /api/projects/:id
// @desc   Get a single project by ID
// @access Private
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    
    if (req.user.role !== 'admin' && !project.members.some(m => m._id.equals(req.user._id))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch project', error: error.message });
  }
};

// @route  PUT /api/projects/:id
// @desc   Update a project (Admin only)
// @access Private/Admin
const updateProject = async (req, res) => {
  try {
    const { name, description, members } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    
    project.name = name || project.name;
    project.description = description !== undefined ? description : project.description;
    project.members = members !== undefined ? members : project.members;

    await project.save();
    await project.populate('createdBy', 'name email');
    await project.populate('members', 'name email');

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update project', error: error.message });
  }
};

// @route  DELETE /api/projects/:id
// @desc   Delete a project and its tasks (Admin only)
// @access Private/Admin
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Also delete all tasks that belong to this project
    await Task.deleteMany({ project: req.params.id });
    await project.deleteOne();

    res.json({ message: 'Project and its tasks deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete project', error: error.message });
  }
};

module.exports = { getProjects, createProject, getProjectById, updateProject, deleteProject };
