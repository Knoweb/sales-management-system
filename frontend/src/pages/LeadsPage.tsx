import React from 'react';
import { PageHeader } from '../components/PageHeader';
import { LeadList } from '../components/leads/LeadList';
import { Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LeadsPage: React.FC = () => {
  const { user } = useAuth();
  const canCreate = user?.permissions.includes('LEAD_CREATE');

  return (
    <div className="page-container">
      <PageHeader 
        title={<><Briefcase className="page-icon" style={{ display: 'inline', marginRight: '0.5rem' }} /> Leads</>}
        actionButton={
          canCreate ? {
            label: 'Create Lead',
            onClick: () => window.location.href = '/leads/new'
          } : undefined
        }
      />
      
      <div className="page-content">
        <LeadList />
      </div>
    </div>
  );
};
