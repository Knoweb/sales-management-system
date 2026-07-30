import React from 'react';
import { PageHeader } from '../components/PageHeader';
import { LeadDetails } from '../components/leads/LeadDetails';
import { Briefcase } from 'lucide-react';
import { useParams } from 'react-router-dom';

export const LeadDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="page-container">
      <PageHeader 
        title={<><Briefcase className="page-icon" style={{ display: 'inline', marginRight: '0.5rem' }} /> Lead Details</>} 
      />
      
      <div className="page-content">
        <LeadDetails leadId={id!} />
      </div>
    </div>
  );
};
