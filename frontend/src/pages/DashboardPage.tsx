import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Activity, Users, Building2, TrendingUp, Settings, LayoutDashboard } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { EmptyState } from '../components/FeedbackStates';
import { Card } from '../components/Card';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  // Group permissions logically based on prefixes
  const permissionGroups: Record<string, { perms: string[], icon: React.ReactNode, color: string, bg: string }> = {
    'USER & ACCESS': { perms: [], icon: <ShieldAlert size={20} />, color: '#4f46e5', bg: 'rgba(79, 70, 229, 0.1)' },
    'HR & EMPLOYEES': { perms: [], icon: <Users size={20} />, color: '#0891b2', bg: 'rgba(8, 145, 178, 0.1)' },
    'SALES & CLIENTS': { perms: [], icon: <Building2 size={20} />, color: '#7c3aed', bg: 'rgba(124, 58, 237, 0.1)' },
    'OPPORTUNITIES': { perms: [], icon: <TrendingUp size={20} />, color: 'var(--color-primary)', bg: 'var(--color-primary-soft)' },
    'SYSTEM': { perms: [], icon: <Settings size={20} />, color: '#64748b', bg: 'rgba(100, 116, 139, 0.1)' }
  };

  user?.permissions.forEach(perm => {
    if (perm.startsWith('USER_') || perm.startsWith('ROLE_')) {
      permissionGroups['USER & ACCESS'].perms.push(perm);
    } else if (perm.startsWith('EMPLOYEE_') || perm.startsWith('DEPARTMENT_') || perm.startsWith('SKILL_')) {
      permissionGroups['HR & EMPLOYEES'].perms.push(perm);
    } else if (perm.startsWith('CLIENT_') || perm.startsWith('LEAD_')) {
      permissionGroups['SALES & CLIENTS'].perms.push(perm);
    } else if (perm.startsWith('OPPORTUNITY_')) {
      permissionGroups['OPPORTUNITIES'].perms.push(perm);
    } else {
      permissionGroups['SYSTEM'].perms.push(perm);
    }
  });

  const activeGroups = Object.entries(permissionGroups).filter(([, group]) => group.perms.length > 0);

  return (
    <>
      <PageHeader 
        title={`Welcome back, ${user?.firstName}!`}
        description="Here is your daily system overview and access profile."
        icon={<LayoutDashboard size={24} />}
      />

      <Card className="card-primary" style={{ marginBottom: '24px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h3 className="text-section-title" style={{ marginBottom: '1rem' }}>Assigned Roles</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            {user?.roles.map(role => (
              <div key={role} style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.75rem', 
                padding: '12px 20px', 
                backgroundColor: 'var(--color-surface-accent)', 
                borderRadius: 'var(--radius-md)', 
                border: '1px solid var(--color-border-strong)',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <ShieldAlert size={20} style={{ color: 'var(--color-primary)' }} />
                <span className="text-body" style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{role.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-section-title" style={{ marginBottom: '1rem' }}>Granted Permissions</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '1.5rem' 
          }}>
            {activeGroups.map(([groupName, group]) => (
              <Card key={groupName} className="card-secondary" style={{ padding: '20px', borderTop: `4px solid ${group.color}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{
                    width: '36px', height: '36px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: group.bg,
                    color: group.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {group.icon}
                  </div>
                  <div className="text-label" style={{ fontWeight: 600 }}>{groupName}</div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {group.perms.map(perm => (
                    <span key={perm} className="badge badge-gray" style={{ 
                      backgroundColor: 'var(--color-background)',
                      border: '1px solid var(--color-border)',
                      padding: '4px 10px',
                    }}>
                      {perm}
                    </span>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Card>
      
      <div style={{ marginTop: '2rem' }}>
        <EmptyState 
          icon={<Activity size={48} />}
          title="Business Modules Pending"
          message="Phase 1 & 2 foundations are complete. Business logic, pipelines, and reporting will appear here shortly."
        />
      </div>
    </>
  );
};
