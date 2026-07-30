import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, CheckCircle, Briefcase } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Welcome back, {user?.firstName}!</h1>
        <p className="page-description">Here is your daily overview.</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Your Access Profile</h2>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            
            <div>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assigned Roles</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {user?.roles.map(role => (
                  <div key={role} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <ShieldAlert size={18} color="var(--accent-primary)" />
                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{role.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Granted Permissions</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {user?.permissions.map(perm => (
                  <span key={perm} className="badge badge-green flex-between gap-2" style={{ padding: '0.25rem 0.75rem' }}>
                    <CheckCircle size={12} />
                    {perm}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
      
      <div className="empty-state card" style={{ marginTop: '2rem' }}>
        <Briefcase size={48} />
        <h3 style={{ fontSize: '1.125rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Business Modules Pending</h3>
        <p>Phase 1 & 2 foundations are complete. Business logic, pipelines, and reporting will appear here shortly.</p>
      </div>
    </>
  );
};
