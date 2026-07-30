import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, CheckCircle, Briefcase } from 'lucide-react';

export const AuthenticatedLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} />, allowed: true },
    { name: 'User Management', path: '/users', icon: <Users size={18} />, allowed: user?.roles.includes('SYSTEM_ADMIN') },
    { name: 'Departments', path: '/departments', icon: <Briefcase size={18} />, allowed: user?.roles.includes('SYSTEM_ADMIN') || user?.roles.includes('TOP_MANAGEMENT') },
    { name: 'Employees', path: '/employees', icon: <Users size={18} />, allowed: user?.roles.includes('SYSTEM_ADMIN') || user?.roles.includes('TOP_MANAGEMENT') },
    { name: 'Skills', path: '/skills', icon: <CheckCircle size={18} />, allowed: user?.roles.includes('SYSTEM_ADMIN') },
  ];

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
                  className={`nav-link flex-between gap-2 ${location.pathname.startsWith(item.path) ? 'active' : ''}`}
                >
                  {item.icon} {item.name}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="nav-user">
            <div className="user-info">
              <span className="user-name">{user?.firstName} {user?.lastName}</span>
              <span className="user-role">{user?.roles[0]?.replace('_', ' ') || 'User'}</span>
            </div>
            <button onClick={handleLogout} className="btn-logout" title="Logout">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  );
};
