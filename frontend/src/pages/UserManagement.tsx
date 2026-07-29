import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/Api';
import type { User } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, Briefcase, Search, RefreshCw } from 'lucide-react';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination & Filters
  const [page, setPage] = useState(0);
  const size = 20; // Hardcode size for now since we don't have a UI for it
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const { user: currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} />, allowed: true },
    { name: 'User Management', path: '/users', icon: <Users size={18} />, allowed: currentUser?.roles.includes('SYSTEM_ADMIN') },
  ];

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0); // Reset page on new search
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchUsers = async (currentPage: number, currentSize: number, currentSearch: string) => {
    setError('');
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('size', currentSize.toString());
      if (currentSearch) {
        params.append('search', currentSearch);
      }
      
      const response = await apiClient.get(`/users?${params.toString()}`);
      if (response.data && Array.isArray(response.data.content)) {
        setUsers(response.data.content);
      } else if (Array.isArray(response.data)) {
        setUsers(response.data);
      }
    } catch {
      setError('Failed to load users. Please check your connection or permissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers(page, size, debouncedSearch);
  }, [page, size, debouncedSearch]);

  const handleRefresh = () => {
    fetchUsers(page, size, debouncedSearch);
  };

  return (
    <div className="dashboard-layout">
      <nav className="dashboard-nav">
        <div className="nav-container">
          <div className="flex-between gap-4">
            <div className="nav-brand">
              <Briefcase size={24} />
              <span>Knoweb Sales</span>
            </div>
            
            <div className="nav-menu">
              {navItems.filter(i => i.allowed).map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link flex-between gap-2 ${location.pathname === item.path ? 'active' : ''}`}
                >
                  {item.icon} {item.name}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="nav-user">
            <div className="user-info">
              <span className="user-name">{currentUser?.firstName} {currentUser?.lastName}</span>
              <span className="user-role">{currentUser?.roles[0]?.replace('_', ' ') || 'User'}</span>
            </div>
            <button onClick={handleLogout} className="btn-logout" title="Logout">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="dashboard-main">
        <div className="page-header flex-between">
          <div>
            <h1 className="page-title">User Management</h1>
            <p className="page-description">Manage system users, roles, and access.</p>
          </div>
          <button 
            onClick={handleRefresh} 
            disabled={loading}
            className="btn-logout" 
            style={{ backgroundColor: 'var(--accent-primary)', color: 'white', borderColor: 'var(--accent-primary)' }}
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh Data
          </button>
        </div>

        {error && (
          <div className="auth-error" style={{ marginBottom: '1.5rem' }}>
            ⚠️ {error}
          </div>
        )}

        <div className="card">
          <div className="card-header flex-between">
            <h2 className="card-title">All Users</h2>
            <div className="input-wrapper" style={{ width: '250px' }}>
              <Search className="input-icon" size={16} />
              <input 
                type="text" 
                className="form-input" 
                placeholder="Search users..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="table-wrapper">
            {loading ? (
               <div className="empty-state">
                  <div className="spinner spinner-primary mb-4"></div>
                  <p>Loading user database...</p>
               </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email Address</th>
                    <th>System Roles</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="empty-state">No users found.</td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id}>
                        <td style={{ fontWeight: 500 }}>{u.firstName} {u.lastName}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                            {u.roles.map(role => (
                              <span key={role} className={`badge ${role === 'SYSTEM_ADMIN' ? 'badge-blue' : 'badge-gray'}`}>
                                {role.replace('_', ' ')}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-green">Active</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button className="nav-link" style={{ background: 'none', border: 'none' }}>Edit</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
