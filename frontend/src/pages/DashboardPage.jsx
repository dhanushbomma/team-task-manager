// =============================================
// pages/DashboardPage.jsx
// =============================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

// Helper: format a date nicely
const formatDate = (d) => d ? new Date(d).toLocaleDateString() : 'No due date';

// Helper: get badge class for status
const statusBadge = (status) => {
  if (status === 'To Do')      return 'badge badge-todo';
  if (status === 'In Progress') return 'badge badge-inprogress';
  if (status === 'Done')        return 'badge badge-done';
  return 'badge';
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/tasks/dashboard');
        setStats(data);
      } catch (err) {
        console.error('Failed to load dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div style={{ color: '#9ca3af', padding: '40px' }}>Loading dashboard...</div>;

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Hello, {user?.name} 👋</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginTop: '4px' }}>
            Here's what's happening with your tasks today.
          </p>
        </div>
        <span className={`badge badge-${user?.role}`}>{user?.role}</span>
      </div>

      {/* Status stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats?.total || 0}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#6b7280' }}>{stats?.todo || 0}</div>
          <div className="stat-label">To Do</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#2563eb' }}>{stats?.inProgress || 0}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#16a34a' }}>{stats?.done || 0}</div>
          <div className="stat-label">Done</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#dc2626' }}>{stats?.overdueTasks?.length || 0}</div>
          <div className="stat-label">Overdue</div>
        </div>
      </div>

      <div className="grid-2">
        {/* Recent tasks */}
        <div className="card">
          <h2 className="card-title">Recent Tasks</h2>
          {stats?.recentTasks?.length === 0 ? (
            <div className="empty-state">
              <h3>No tasks yet</h3>
              <p>Tasks assigned to you will appear here.</p>
            </div>
          ) : (
            <div>
              {stats?.recentTasks?.map(task => (
                <div key={task._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{task.title}</div>
                    <div style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '2px' }}>
                      {task.project?.name} · Due {formatDate(task.dueDate)}
                    </div>
                  </div>
                  <span className={statusBadge(task.status)}>{task.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Overdue tasks */}
        <div className="card">
          <h2 className="card-title" style={{ color: '#dc2626' }}>⚠️ Overdue Tasks</h2>
          {stats?.overdueTasks?.length === 0 ? (
            <div className="empty-state">
              <h3>No overdue tasks!</h3>
              <p>You're all caught up. Great work!</p>
            </div>
          ) : (
            <div>
              {stats?.overdueTasks?.map(task => (
                <div key={task._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{task.title}</div>
                    <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '2px' }}>
                      Due {formatDate(task.dueDate)}
                    </div>
                  </div>
                  <span className="badge badge-overdue">Overdue</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
