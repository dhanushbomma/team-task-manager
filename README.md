# 📋 Team Task Manager

A full-stack web application for managing team projects and tasks with role-based access control.

---

## 🗂 Project Structure

```
team-task-manager/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      # Login, signup, profile
│   │   ├── projectController.js   # CRUD for projects
│   │   ├── taskController.js      # CRUD for tasks + dashboard
│   │   └── userController.js      # List users
│   ├── middleware/
│   │   └── authMiddleware.js      # JWT auth + admin guard
│   ├── models/
│   │   ├── User.js                # User schema
│   │   ├── Project.js             # Project schema
│   │   └── Task.js                # Task schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── taskRoutes.js
│   │   └── userRoutes.js
│   ├── .env.example               # Environment variable template
│   ├── package.json
│   ├── seed.js                    # Sample data seeder
│   └── server.js                  # Entry point
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── Layout.jsx         # Sidebar + page wrapper
    │   ├── context/
    │   │   └── AuthContext.jsx    # Global auth state
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── SignupPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   ├── ProjectsPage.jsx
    │   │   └── TasksPage.jsx
    │   ├── utils/
    │   │   └── api.js             # Axios instance with JWT
    │   ├── App.jsx                # Routes
    │   ├── index.css              # Global styles
    │   └── main.jsx               # React entry point
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## ⚙️ Local Setup (VS Code)

### Prerequisites
- Node.js v18+ installed
- MongoDB running locally OR a free MongoDB Atlas account
- Git (optional)

---

### Step 1 — Set up the Backend

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and fill in your values:

```
MONGO_URI=mongodb://localhost:27017/team-task-manager
JWT_SECRET=any_long_random_secret_string
PORT=5000
CLIENT_URL=http://localhost:5173
```

**Start the backend:**
```bash
npm run dev
```

**Seed sample data (optional but recommended for testing):**
```bash
npm run seed
```

---

### Step 2 — Set up the Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Open your browser at: **http://localhost:5173**

---

### 🔑 Demo Login Credentials (after seeding)

| Role   | Email                | Password    |
|--------|----------------------|-------------|
| Admin  | admin@example.com    | password123 |
| Member | bob@example.com      | password123 |
| Member | carol@example.com    | password123 |

---

## 🔐 Roles & Permissions

| Feature                    | Admin | Member |
|---------------------------|-------|--------|
| Create / edit / delete projects | ✅ | ❌ |
| View their projects        | ✅    | ✅     |
| Create / delete tasks      | ✅    | ❌     |
| Assign tasks to members    | ✅    | ❌     |
| Update task status         | ✅    | ✅ (own tasks only) |
| View dashboard stats       | ✅    | ✅     |

---

## 🚀 Deployment on Railway

### Step 1 — Push to GitHub
Create a new GitHub repo and push this folder.

### Step 2 — Deploy Backend

1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Select your repo → choose the `backend` folder
3. Add environment variables in Railway dashboard:
   - `MONGO_URI` → your MongoDB Atlas connection string
   - `JWT_SECRET` → a strong random string
   - `PORT` → Railway sets this automatically
   - `CLIENT_URL` → your deployed frontend URL (add after deploying frontend)

### Step 3 — Deploy Frontend

1. In the same Railway project → New Service → GitHub repo
2. Set root directory to `frontend`
3. Add environment variable:
   - `VITE_API_URL` → your deployed backend URL + `/api`
4. Update `frontend/src/utils/api.js` baseURL to use `import.meta.env.VITE_API_URL`

### Step 4 — Add a MongoDB Database
- Use [MongoDB Atlas](https://mongodb.com/atlas) free tier → get connection string → add to backend `MONGO_URI`

---

## 📮 Sample API Requests (Postman)

### Auth

**Signup**
```
POST http://localhost:5000/api/auth/signup
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "role": "member"
}
```

**Login**
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}
```
→ Copy the `token` from the response and use it as `Bearer <token>` in the Authorization header for all protected routes.

---

### Projects (Admin token required for write operations)

**Get All Projects**
```
GET http://localhost:5000/api/projects
Authorization: Bearer <token>
```

**Create Project**
```
POST http://localhost:5000/api/projects
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "New Website",
  "description": "Redesign the company site",
  "members": ["<user_id_1>", "<user_id_2>"]
}
```

---

### Tasks

**Get Dashboard Stats**
```
GET http://localhost:5000/api/tasks/dashboard
Authorization: Bearer <token>
```

**Get All Tasks**
```
GET http://localhost:5000/api/tasks
Authorization: Bearer <token>
```

**Create Task (Admin)**
```
POST http://localhost:5000/api/tasks
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "title": "Build login page",
  "description": "Implement the login UI",
  "projectId": "<project_id>",
  "assignedTo": "<user_id>",
  "status": "To Do",
  "dueDate": "2024-12-31"
}
```

**Update Task Status (Member)**
```
PUT http://localhost:5000/api/tasks/<task_id>
Authorization: Bearer <member-token>
Content-Type: application/json

{
  "status": "In Progress"
}
```
