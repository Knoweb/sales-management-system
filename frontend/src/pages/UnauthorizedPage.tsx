import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '../components/Button';

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
        <div style={{ display: 'inline-block', backgroundColor: 'var(--color-danger-bg)', padding: '16px', borderRadius: '50%', marginBottom: '1.5rem' }}>
           <ShieldAlert size={48} color="var(--color-danger)" />
        </div>
        <h1 className="auth-title">Access Denied</h1>
        <p className="auth-subtitle" style={{ marginBottom: '2rem' }}>
          You do not have the necessary permissions to view this page.
        </p>
        <Button variant="primary" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={16} /> Return to Dashboard
        </Button>
      </div>
    </div>
  );
};
