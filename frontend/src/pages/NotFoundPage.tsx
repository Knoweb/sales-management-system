import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchX, ArrowLeft } from 'lucide-react';
import { Button } from '../components/Button';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
        <div style={{ display: 'inline-block', backgroundColor: 'var(--color-surface-secondary)', padding: '16px', borderRadius: '50%', marginBottom: '1.5rem' }}>
           <SearchX size={48} color="var(--color-text-secondary)" />
        </div>
        <h1 className="auth-title">404 - Page Not Found</h1>
        <p className="auth-subtitle" style={{ marginBottom: '2rem' }}>
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Button variant="primary" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={16} /> Return to Dashboard
        </Button>
      </div>
    </div>
  );
};
