import React from 'react';
import { Target } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { LeadForm } from '../components/leads/LeadForm';

export const LeadFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  return (
    <div className="p-6 max-w-4xl mx-auto w-full">
      <PageHeader
        title={isEditing ? 'Edit Lead' : 'Create Lead'}
        icon={<Target size={24} />}
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
