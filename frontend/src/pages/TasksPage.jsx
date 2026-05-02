// =============================================
// pages/TasksPage.jsx
// =============================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const STATUS_OPTIONS = ['To Do', 'In Progress', 'Done'];

const statusBadge = (status) => {
  if (status === 'To Do')       return 'badge badge-todo';
  if (status === 'In Progress') return 'badge badge-inprogress';
  if (status === 'Done')        return 'badge badge-done';
  return 'badge';
};

const formatDate = (d) => d ? new Date(d).toLocaleDateString() : '—';

const isOverdue = (task) =>
  task.dueDate && task.status !== 'Done' && new Date(task.dueDate) < new Date();

export default function TasksPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [tasks, setTasks]       = useState([]);
  const [projects, setProjects] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask]   = useState(null);
  const [filterProject, setFilterProject] = useState('');
  const [form, setForm] = useState({
    title: '', description: '', projectId: '', assignedTo: '', status: 'To Do', dueDate: '',
  });
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      const params = filterProject ? `?projectId=${filterProject}` : '';
      const [taskRes, projRes, usersRes] = await Promise.all([
        api.get(`/tasks${params}`),
        api.get('/projects'),
        isAdmin ? api.get('/users') : Promise.resolve({ data: [] }),
      ]);
      setTasks(taskRes.data);
      setProjects(projRes.data);
      setAllUsers(usersRes.data);
    } catch (err) {
      console.error('Failed to load tasks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [filterProject]);

  const openCreateModal = () => {
    setEditTask(null);
    setForm({ title: '', description: '', projectId: '', assignedTo: '', status: 'To Do', dueDate: '' });
    setError('');
    setShowModal(true);
  };

  const openEditModal = (task) => {
    setEditTask(task);
    setForm({
      title: task.title,
      description: task.description,
      projectId: task.project?._id || '',
      assignedTo: task.assignedTo?._id || '',
      status: task.status,
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = isAdmin ? form : { status: form.status }; // Members can only change status
      if (editTask) {
        await api.put(`/tasks/${editTask._id}`, payload);
      } else {
        await api.post('/tasks', form);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      loadData();
    } catch (err) {
      alert('Failed to delete task');
    }
  };

  if (loading) return <div style={{ color: '#9ca3af', padding: '40px' }}>Loading tasks...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Tasks</h1>
        {isAdmin && (
          <button className="btn btn-primary" onClick={openCreateModal}>+ New Task</button>
        )}
      </div>

      {/* Filter by project */}
      <div style={{ marginBottom: '20px' }}>
        <select
          className="form-input"
          style={{ maxWidth: '280px' }}
          value={filterProject}
          onChange={e => setFilterProject(e.target.value)}
        >
          <option value="">All Projects</option>
          {projects.map(p => (
            <option key={p._id} value={p._id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Tasks table */}
      <div className="card">
        {tasks.length === 0 ? (
          <div className="empty-state">
            <h3>No tasks found</h3>
            <p>{isAdmin ? 'Create your first task above.' : 'No tasks have been assigned to you yet.'}</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Project</th>
                  <th>Assigned To</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task._id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{task.title}</div>
                      {task.description && (
                        <div style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '2px' }}>
                          {task.description.slice(0, 60)}{task.description.length > 60 ? '…' : ''}
                        </div>
                      )}
                    </td>
                    <td>{task.project?.name || '—'}</td>
                    <td>{task.assignedTo?.name || <span style={{ color: '#9ca3af' }}>Unassigned</span>}</td>
                    <td><span className={statusBadge(task.status)}>{task.status}</span></td>
                    <td>
                      <span style={{ color: isOverdue(task) ? '#dc2626' : 'inherit' }}>
                        {formatDate(task.dueDate)}
                        {isOverdue(task) && ' ⚠️'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {/* Admin edits everything; member can only update status on their own tasks */}
                        {(isAdmin || task.assignedTo?._id === user?._id) && (
                          <button className="btn btn-ghost btn-sm" onClick={() => openEditModal(task)}>
                            {isAdmin ? '✏️ Edit' : '🔄 Status'}
                          </button>
                        )}
                        {isAdmin && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(task._id)}>🗑️</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editTask ? (isAdmin ? 'Edit Task' : 'Update Status') : 'New Task'}
              </h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>

            {error && <div className="error-msg">{error}</div>}

            <form onSubmit={handleSubmit}>
              {/* Admin-only fields */}
              {isAdmin && (
                <>
                  <div className="form-group">
                    <label className="form-label">Title *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={form.title}
                      onChange={e => setForm({ ...form, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-input"
                      value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })}
                    />
                  </div>

                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Project *</label>
                      <select
                        className="form-input"
                        value={form.projectId}
                        onChange={e => setForm({ ...form, projectId: e.target.value })}
                        required
                      >
                        <option value="">Select project</option>
                        {projects.map(p => (
                          <option key={p._id} value={p._id}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Assign To</label>
                      <select
                        className="form-input"
                        value={form.assignedTo}
                        onChange={e => setForm({ ...form, assignedTo: e.target.value })}
                      >
                        <option value="">Unassigned</option>
                        {allUsers.filter(u => u.role === 'member').map(u => (
                          <option key={u._id} value={u._id}>{u.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Due Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={form.dueDate}
                      onChange={e => setForm({ ...form, dueDate: e.target.value })}
                    />
                  </div>
                </>
              )}

              {/* Status is editable by both admin and member */}
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-input"
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                >
                  {STATUS_OPTIONS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
