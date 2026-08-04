import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, Link, useLocation, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, UsersRound, Building2, ContactRound, BadgeCheck, 
  Handshake, Target, CalendarClock, TrendingUp,
  LogOut, Menu, X, Sun, Moon, ClipboardCheck,
  Briefcase, Waypoints, Users
} from 'lucide-react';
import NotificationsDropdown from './NotificationsDropdown';
import { IconButton } from './IconButton';
import { EmployeeApi } from '../services/EmployeeApi';

export const AuthenticatedLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDeptHead, setIsDeptHead] = useState(false);

  const fetchedUserEmailRef = useRef<string | null>(null);

  useEffect(() => {
    const checkDeptHead = async () => {
      if (user && fetchedUserEmailRef.current !== user.email) {
        fetchedUserEmailRef.current = user.email;
        try {
          const profileRes = await EmployeeApi.getMyProfile();
          setIsDeptHead(profileRes.linked && profileRes.departmentHead);
        } catch {
          setIsDeptHead(false);
        }
      } else if (!user) {
        fetchedUserEmailRef.current = null;
        setIsDeptHead(false);
      }
    };
    checkDeptHead();
  }, [user]);

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
    { name: 'User Management', path: '/users', icon: <UsersRound size={20} />, allowed: user?.permissions.includes('USER_READ') },
    { name: 'Departments', path: '/departments', icon: <Building2 size={20} />, allowed: user?.permissions.includes('DEPARTMENT_READ') },
    { name: 'Employees', path: '/employees', icon: <ContactRound size={20} />, allowed: user?.permissions.includes('EMPLOYEE_READ') },
    { name: 'Skills', path: '/skills', icon: <BadgeCheck size={20} />, allowed: user?.permissions.includes('SKILL_CATALOG_READ') },
    { name: 'Clients', path: '/clients', icon: <Handshake size={20} />, allowed: user?.permissions.includes('CLIENT_READ') },
    { name: 'Leads', path: '/leads', icon: <Target size={20} />, allowed: user?.permissions.includes('LEAD_READ') },
    { name: 'Follow-ups', path: '/follow-ups', icon: <CalendarClock size={20} />, allowed: user?.permissions.includes('LEAD_READ') },
    { name: 'Opportunities', path: '/opportunities', icon: <TrendingUp size={20} />, allowed: user?.permissions.includes('OPPORTUNITY_READ') },
    { name: 'BDM Approvals', path: '/bdm-approvals', icon: <ClipboardCheck size={20} />, allowed: user?.permissions?.includes('BDM_APPROVAL_READ') || user?.permissions?.includes('BDM_APPROVAL_DECIDE') },
    { name: 'Technical Projects', path: '/technical-projects', icon: <Waypoints size={20} />, allowed: user?.permissions?.includes('TECHNICAL_PROJECT_ROUTE') },
    { name: 'Dept Projects', path: '/hod/projects', icon: <Users size={20} />, allowed: isDeptHead },
  ];

  return (
    <div className="dashboard-layout">
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} aria-hidden="true"></div>
      )}

      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`} aria-label="Main Navigation">
        <div className="sidebar-header">
          <div className="nav-brand">
            <Briefcase size={24} className="brand-icon" />
            <span className="brand-text">Knoweb Sales</span>
          </div>
          <button 
            className="btn-close-sidebar" 
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
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
                aria-current={isActive ? 'page' : undefined}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              className="btn-mobile-menu" 
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
          </div>
          
          <div className="topbar-right">
            <IconButton 
              icon={theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />} 
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              variant="ghost"
              title="Toggle theme"
            />
            
            <NotificationsDropdown />
            
            <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--color-border)', margin: '0 0.5rem' }}></div>
            
            <div className="user-info">
              <span className="user-name">{user?.firstName} {user?.lastName}</span>
              <span className="user-role">{user?.roles[0]?.replace('_', ' ') || 'User'}</span>
            </div>
            
            <IconButton 
              icon={<LogOut size={18} />} 
              onClick={handleLogout} 
              variant="ghost" 
              aria-label="Logout"
              title="Logout"
              style={{ color: 'var(--color-danger)' }}
            />
          </div>
        </header>

        <main className="dashboard-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
