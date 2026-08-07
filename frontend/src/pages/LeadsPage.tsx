import React, { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { LeadList } from '../components/leads/LeadList';
import { Target } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LeadForm } from '../components/leads/LeadForm';

export const LeadsPage: React.FC = () => {
  const { user } = useAuth();
  const canCreate = user?.permissions.includes('LEAD_CREATE');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <PageHeader 
        title="Leads"
        description="Manage leads and track sales opportunities."
        icon={<Target size={24} />}
        actionButton={
          canCreate ? {
            label: 'Create Lead',
            onClick: () => setIsCreateOpen(true)
          } : undefined
        }
      />
      
      <LeadList refreshTrigger={refreshTrigger} />

      {isCreateOpen && (
        <LeadForm
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSuccess={() => {
            setIsCreateOpen(false);
            setRefreshTrigger(prev => prev + 1);
          }}
        />
      )}
    </div>
  );
};
