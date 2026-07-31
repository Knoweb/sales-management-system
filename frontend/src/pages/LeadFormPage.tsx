import React from 'react';
import { Briefcase } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { LeadForm } from '../components/leads/LeadForm';

export const LeadFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  return (
    <div className="page-container">
      <PageHeader
        title={
          <>
            <Briefcase
              className="page-icon"
              size={24}
              style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }}
              aria-hidden="true"
            />
            {isEditing ? 'Edit Lead' : 'Create Lead'}
          </>
        }
        description={
          isEditing
            ? 'Update lead information and sales progress.'
            : 'Register a new sales inquiry and assign it to a client.'
        }
      />

      <LeadForm />
    </div>
  );
};
