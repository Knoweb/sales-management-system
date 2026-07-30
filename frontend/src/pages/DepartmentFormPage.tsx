import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DepartmentApi } from '../services/DepartmentApi';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';
import type { CreateDepartmentRequest } from '../types/department';

export const DepartmentFormPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateDepartmentRequest>({
    code: '',
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await DepartmentApi.create(formData);
      navigate('/departments');
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to create department');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="page-container">
      <PageHeader 
        title="Create Department"
        description="Add a new department to the system."
      />

      <div className="card" style={{ maxWidth: '600px' }}>
        <div className="card-body">
          {error && <div className="error-message" style={{ color: 'var(--error)', marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'var(--error-bg)', borderRadius: 'var(--radius-md)' }}>{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Code *</label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                disabled={loading}
                style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                placeholder="e.g. IT"
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={loading}
                style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                placeholder="e.g. Information Technology"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={loading}
                style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', minHeight: '100px' }}
                placeholder="Department description..."
              />
            </div>

            <div className="flex-between" style={{ justifyContent: 'flex-end', gap: '1rem' }}>
              <Button type="button" variant="ghost" onClick={() => navigate('/departments')} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={loading}>
                Save Department
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
