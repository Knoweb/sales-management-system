import React from 'react';
import { PageHeader } from '../components/PageHeader';
import { LeadDetails } from '../components/leads/LeadDetails';
import { Briefcase } from 'lucide-react';
import { useParams } from 'react-router-dom';

export const LeadDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <PageHeader 
        title={
          <div className="flex items-center gap-2">
            <Briefcase size={24} className="inline-icon text-blue-600" />
            Lead Details
          </div>
        } 
      />
      
      <div className="mt-6">
        <LeadDetails leadId={id!} />
      </div>
    </div>
  );
};
