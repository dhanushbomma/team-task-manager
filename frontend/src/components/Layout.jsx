// =============================================
// components/Layout.jsx - Sidebar + main content
// =============================================

import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="layout">
      {/* ---- Sidebar ---- */}
      <aside className="sidebar">
        <div className="sidebar-logo">📋 TaskManager</div>

        <nav className="sidebar-nav">
          <button
            className={`nav-link ${isActive('/') && !isActive('/projects') && !isActive('/tasks') ? 'active' : ''}`}
            onClick={() => navigate('/')}
          >
            🏠 Dashboard
          </button>

          <button
            className={`nav-link ${isActive('/projects') ? 'active' : ''}`}
            onClick={() => navigate('/projects')}
          >
            📁 Projects
          </button>

          <button
            className={`nav-link ${isActive('/tasks') ? 'active' : ''}`}
            onClick={() => navigate('/tasks')}
          >
            ✅ Tasks
          </button>
        </nav>

        <div className="sidebar-footer">
          <div style={{ marginBottom: '8px' }}>
            <strong>{user?.name}</strong>
            <span className={`badge badge-${user?.role}`} style={{ marginLeft: '8px' }}>
              {user?.role}
            </span>
          </div>
          <div style={{ marginBottom: '8px', color: '#9ca3af', fontSize: '0.75rem' }}>{user?.email}</div>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout} style={{ width: '100%' }}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* ---- Page Content ---- */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
