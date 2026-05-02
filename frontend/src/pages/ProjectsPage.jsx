// =============================================
// pages/ProjectsPage.jsx
// =============================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function ProjectsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [projects, setProjects] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState(null); // null = create mode
  const [form, setForm] = useState({ name: '', description: '', members: [] });
  const [error, setError] = useState('');

  // Load projects (and users if admin)
  const loadData = async () => {
    try {
      const [projRes, usersRes] = await Promise.all([
        api.get('/projects'),
        isAdmin ? api.get('/users') : Promise.resolve({ data: [] }),
      ]);
      setProjects(projRes.data);
      setAllUsers(usersRes.data);
    } catch (err) {
      console.error('Failed to load projects', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const openCreateModal = () => {
    setEditProject(null);
    setForm({ name: '', description: '', members: [] });
    setError('');
    setShowModal(true);
  };

  const openEditModal = (project) => {
    setEditProject(project);
    setForm({
      name: project.name,
      description: project.description,
      members: project.members.map(m => m._id),
    });
    setError('');
    setShowModal(true);
  };

  const handleMemberToggle = (userId) => {
    setForm(prev => ({
      ...prev,
      members: prev.members.includes(userId)
        ? prev.members.filter(id => id !== userId)
        : [...prev.members, userId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editProject) {
        await api.put(`/projects/${editProject._id}`, form);
      } else {
        await api.post('/projects', form);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save project');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project and all its tasks? This cannot be undone.')) return;
    try {
      await api.delete(`/projects/${id}`);
      loadData();
    } catch (err) {
      alert('Failed to delete project');
    }
  };

  if (loading) return <div style={{ color: '#9ca3af', padding: '40px' }}>Loading projects...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Projects</h1>
        {isAdmin && (
          <button className="btn btn-primary" onClick={openCreateModal}>+ New Project</button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <h3>No projects yet</h3>
            <p>{isAdmin ? 'Create your first project to get started.' : 'You have not been added to any projects yet.'}</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {projects.map(project => (
            <div key={project._id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '6px' }}>{project.name}</h2>
                  {project.description && (
                    <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '12px' }}>{project.description}</p>
                  )}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                      👤 Created by {project.createdBy?.name}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                      👥 {project.members?.length} member(s)
                    </span>
                  </div>
                  {project.members?.length > 0 && (
                    <div style={{ marginTop: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {project.members.map(m => (
                        <span key={m._id} className="badge badge-member">{m.name}</span>
                      ))}
                    </div>
                  )}
                </div>
                {isAdmin && (
                  <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEditModal(project)}>✏️ Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(project._id)}>🗑️ Delete</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editProject ? 'Edit Project' : 'New Project'}</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>

            {error && <div className="error-msg">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Project Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="What is this project about?"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Team Members</label>
                <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px', maxHeight: '180px', overflowY: 'auto' }}>
                  {allUsers.filter(u => u.role === 'member').map(u => (
                    <label key={u._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={form.members.includes(u._id)}
                        onChange={() => handleMemberToggle(u._id)}
                      />
                      <span style={{ fontSize: '0.875rem' }}>{u.name} <span style={{ color: '#9ca3af' }}>({u.email})</span></span>
                    </label>
                  ))}
                  {allUsers.filter(u => u.role === 'member').length === 0 && (
                    <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>No members available yet.</p>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editProject ? 'Save Changes' : 'Create Project'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
