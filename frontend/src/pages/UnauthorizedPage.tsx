import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
        <div style={{ display: 'inline-block', backgroundColor: 'var(--error-bg)', padding: '16px', borderRadius: '50%', marginBottom: '1.5rem' }}>
           <ShieldAlert size={48} color="var(--error)" />
        </div>
        <h1 className="auth-title">Access Denied</h1>
        <p className="auth-subtitle" style={{ marginBottom: '2rem' }}>
          You do not have the necessary permissions to view this page.
        </p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="auth-button"
          style={{ width: 'auto', display: 'inline-flex', padding: '0.75rem 1.5rem' }}
        >
          <ArrowLeft size={16} /> Return to Dashboard
        </button>
      </div>
    </div>
  );
};
