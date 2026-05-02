// =============================================
// seed.js - Populate the database with sample data
// Run with: npm run seed
// =============================================

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Project.deleteMany();
    await Task.deleteMany();
    console.log('Cleared existing data');

    // Create sample users
    const admin = await User.create({
      name: 'Alice Admin',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
    });

    const member1 = await User.create({
      name: 'Bob Smith',
      email: 'bob@example.com',
      password: 'password123',
      role: 'member',
    });

    const member2 = await User.create({
      name: 'Carol Jones',
      email: 'carol@example.com',
      password: 'password123',
      role: 'member',
    });

    console.log('Created users');

    // Create sample projects
    const project1 = await Project.create({
      name: 'Website Redesign',
      description: 'Redesign the company website with a modern look and feel.',
      createdBy: admin._id,
      members: [member1._id, member2._id],
    });

    const project2 = await Project.create({
      name: 'Mobile App Development',
      description: 'Build a cross-platform mobile app for customers.',
      createdBy: admin._id,
      members: [member1._id],
    });

    console.log('Created projects');

    // Create sample tasks
    const today = new Date();
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - 3); // 3 days ago (overdue)
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + 7); // 7 days from now

    await Task.create([
      {
        title: 'Design new homepage mockup',
        description: 'Create wireframes and high-fidelity mockups for the new homepage.',
        project: project1._id,
        assignedTo: member1._id,
        createdBy: admin._id,
        status: 'In Progress',
        dueDate: futureDate,
      },
      {
        title: 'Set up CI/CD pipeline',
        description: 'Configure GitHub Actions for automated testing and deployment.',
        project: project1._id,
        assignedTo: member2._id,
        createdBy: admin._id,
        status: 'To Do',
        dueDate: pastDate, // This one is overdue!
      },
      {
        title: 'Build authentication screens',
        description: 'Implement login, signup, and forgot-password screens.',
        project: project2._id,
        assignedTo: member1._id,
        createdBy: admin._id,
        status: 'Done',
        dueDate: futureDate,
      },
      {
        title: 'Write API documentation',
        description: 'Document all REST API endpoints using Swagger or Postman.',
        project: project2._id,
        assignedTo: null,
        createdBy: admin._id,
        status: 'To Do',
        dueDate: null,
      },
    ]);

    console.log('Created tasks');
    console.log('\n✅ Seed complete! Test credentials:');
    console.log('   Admin  → admin@example.com  / password123');
    console.log('   Member → bob@example.com    / password123');
    console.log('   Member → carol@example.com  / password123');

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
};

seed();
