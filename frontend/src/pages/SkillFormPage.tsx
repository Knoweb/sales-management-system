import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SkillApi } from '../services/SkillApi';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { FormField, Input, Textarea } from '../components/Forms';
import { Alert } from '../components/Alert';
import type { CreateSkillRequest } from '../types/skill';
import { BadgeCheck } from 'lucide-react';

export const SkillFormPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateSkillRequest>({
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
      await SkillApi.create(formData);
      navigate('/skills');
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to create skill');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="p-6 max-w-3xl mx-auto w-full">
      <PageHeader 
        title="Create Skill"
        icon={<BadgeCheck size={24} />}
        description="Add a new skill to the global registry."
      />

      <Card>
        {error && <Alert variant="error" style={{ marginBottom: '1.5rem' }}>{error}</Alert>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormField label="Code" required>
            <Input
              name="code"
              value={formData.code}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="e.g. JAVA"
              maxLength={20}
            />
          </FormField>

          <FormField label="Name" required>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="e.g. Java Programming"
              maxLength={100}
            />
          </FormField>

          <FormField label="Description">
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
              placeholder="Skill description..."
              rows={4}
              maxLength={500}
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
            <Button type="button" variant="ghost" onClick={() => navigate('/skills')} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={loading}>
              Save Skill
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
