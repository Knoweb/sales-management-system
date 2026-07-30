import React from 'react';
import { PageHeader } from '../components/PageHeader';
import { LeadForm } from '../components/leads/LeadForm';
import { Briefcase } from 'lucide-react';
import { useParams } from 'react-router-dom';

export const LeadFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  return (
    <div className="page-container">
      <PageHeader 
        title={<><Briefcase className="page-icon" style={{ display: 'inline', marginRight: '0.5rem' }} /> {isEditing ? 'Edit Lead' : 'Create Lead'}</>} 
      />
      
      <div className="page-content">
        <LeadForm />
      </div>
    </div>
  );
};
