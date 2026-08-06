import React, { useState, useEffect } from 'react';
import { SkillApi } from '../../services/SkillApi';
import type { Skill } from '../../types/skill';
import { FormField, Input, Textarea } from '../Forms';
import { Button } from '../Button';
import { Modal } from '../Modal';
import { Alert } from '../Alert';

interface SkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  skill: Skill | null;
  onSuccess: () => void;
}

export const SkillModal: React.FC<SkillModalProps> = ({ isOpen, onClose, skill, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!skill;

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    active: true
  });
  const [formErrors, setFormErrors] = useState({ code: '', name: '' });

  useEffect(() => {
    if (isOpen) {
      if (skill) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFormData({
          code: skill.code,
          name: skill.name,
          description: skill.description || '',
          active: skill.active
        });
      } else {
        setFormData({
          code: '',
          name: '',
          description: '',
          active: true
        });
      }
      setError(null);
      setFormErrors({ code: '', name: '' });
    }
  }, [isOpen, skill]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let finalValue: string | boolean = value;
    
    if (type === 'checkbox') {
      finalValue = (e.target as HTMLInputElement).checked;
    } else if (name === 'active') {
      finalValue = value === 'true';
    }

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  const validate = () => {
    let valid = true;
    const errors = { code: '', name: '' };
    if (!formData.code.trim()) {
      errors.code = 'Skill Code is required';
      valid = false;
    }
    if (!formData.name.trim()) {
      errors.name = 'Skill Name is required';
      valid = false;
    }
    setFormErrors(errors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    try {
      setLoading(true);
      setError(null);
      if (isEdit) {
        await SkillApi.update(skill.id, {
          name: formData.name,
          description: formData.description
        });
      } else {
        await SkillApi.create({
          code: formData.code,
          name: formData.name,
          description: formData.description
        });
      }
      onSuccess();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Failed to save skill');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={() => !loading && onClose()} 
      title={isEdit ? 'Edit Skill' : 'Add Skill'}
    >
      {error && (
        <Alert variant="error" style={{ marginBottom: '1.5rem' }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.5rem' }}>
          <FormField label="Skill Code" required error={formErrors.code} id="code">
            <Input
              id="code"
              type="text"
              name="code"
              required
              disabled={isEdit || loading}
              value={formData.code}
              onChange={handleChange}
              placeholder="e.g. JAVA_DEV"
            />
          </FormField>
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <FormField label="Skill Name" required error={formErrors.name} id="name">
            <Input
              id="name"
              type="text"
              name="name"
              required
              disabled={loading}
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Java Development"
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
              rows={3}
              disabled={loading}
            />
          </FormField>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={loading}
            style={{
              minWidth: '110px',
              height: '42px',
              backgroundColor: '#f1f5f9',
              color: '#475569',
              border: '1px solid #cbd5e1',
              borderRadius: '9px',
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={loading}>
            {isEdit ? 'Save Changes' : 'Create Skill'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
