import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, CheckCircle, Briefcase, Menu, X, Calendar } from 'lucide-react';
import NotificationsDropdown from './NotificationsDropdown';

export const AuthenticatedLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Close sidebar on route change in mobile
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSidebarOpen(false);
  }, [location.pathname]);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} />, allowed: true },
    { name: 'User Management', path: '/users', icon: <Users size={20} />, allowed: user?.permissions.includes('USER_READ') },
    { name: 'Departments', path: '/departments', icon: <Briefcase size={20} />, allowed: user?.permissions.includes('DEPARTMENT_READ') },
    { name: 'Employees', path: '/employees', icon: <Users size={20} />, allowed: user?.permissions.includes('EMPLOYEE_READ') },
    { name: 'Skills', path: '/skills', icon: <CheckCircle size={20} />, allowed: user?.permissions.includes('SKILL_CATALOG_READ') },
    { name: 'Clients', path: '/clients', icon: <Briefcase size={20} />, allowed: user?.permissions.includes('CLIENT_READ') },
    { name: 'Leads', path: '/leads', icon: <Briefcase size={20} />, allowed: user?.permissions.includes('LEAD_READ') },
    { name: 'Follow-ups', path: '/follow-ups', icon: <Calendar size={20} />, allowed: user?.permissions.includes('LEAD_READ') },
    { name: 'Opportunities', path: '/opportunities', icon: <Briefcase size={20} />, allowed: user?.permissions.includes('OPPORTUNITY_READ') },
  ];

  return (
    <div className="dashboard-layout">
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
      )}

      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="nav-brand">
            <Briefcase size={24} className="brand-icon" />
            <span className="brand-text">Knoweb Sales</span>
          </div>
          <button className="btn-close-sidebar" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {navItems.filter(i => i.allowed).map(item => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="dashboard-content-wrapper">
        <header className="dashboard-topbar">
          <button className="btn-mobile-menu" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          
          <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <NotificationsDropdown />
            <div className="user-info">
              <span className="user-name">{user?.firstName} {user?.lastName}</span>
              <span className="user-role">{user?.roles[0]?.replace('_', ' ') || 'User'}</span>
            </div>
            <button onClick={handleLogout} className="btn-logout" title="Logout">
              <LogOut size={16} /> <span className="logout-text">Logout</span>
            </button>
          </div>
        </header>

        <main className="dashboard-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
