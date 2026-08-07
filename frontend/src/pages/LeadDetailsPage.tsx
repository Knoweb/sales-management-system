import React from 'react';
import { LeadDetails } from '../components/leads/LeadDetails';
import { useParams, useNavigate } from 'react-router-dom';

export const LeadDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <div style={{ marginBottom: '20px' }}>
        <button
          type="button"
          onClick={() => navigate('/leads')}
          style={{
            height: '40px',
            paddingInline: '12px',
            backgroundColor: '#f8fafc',
            color: '#475569',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            boxShadow: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer'
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 19-7-7 7-7"/>
            <path d="M19 12H5"/>
          </svg>
          Back to Leads
        </button>
      </div>
      
      <div>
        <LeadDetails leadId={id!} />
      </div>
    </div>
  );
};
