import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DepartmentApi } from '../services/DepartmentApi';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { FormField, Input, Textarea } from '../components/Forms';
import { Alert } from '../components/Alert';
import type { CreateDepartmentRequest } from '../types/department';

import { Building2 } from 'lucide-react';

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
    <div className="p-6 max-w-7xl mx-auto w-full">
      <PageHeader 
        title="Create Department"
        description="Add a new department to the system."
        icon={<Building2 size={24} />}
      />

      <div style={{ maxWidth: '800px' }}>
        <Card>
          {error && (
            <Alert variant="error" style={{ marginBottom: '1.5rem' }}>
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <FormField label="Department Code" required id="code" helpText="e.g. IT, HR, SALES">
                <Input
                  id="code"
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="e.g. IT"
                />
              </FormField>

              <FormField label="Department Name" required id="name">
                <Input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="e.g. Information Technology"
                />
              </FormField>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <FormField label="Description" id="description">
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Detailed description of the department's functions..."
                  style={{ minHeight: '120px' }}
                />
              </FormField>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
              <Button type="button" variant="ghost" onClick={() => navigate('/departments')} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={loading}>
                Save Department
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
