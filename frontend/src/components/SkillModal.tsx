import React, { useState, useEffect } from 'react';
import { SkillApi } from '../services/SkillApi';
import type { Skill } from '../types/skill';
import { Input } from './Forms';
import { Button } from './Button';
import { ErrorState } from './FeedbackStates';
import { X } from 'lucide-react';

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
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">
            {isEdit ? 'Edit Skill' : 'Add Skill'}
          </h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {error && <ErrorState message={error} />}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Skill Code"
            type="text"
            name="code"
            required
            disabled={isEdit}
            value={formData.code}
            onChange={handleChange}
            error={formErrors.code}
            placeholder="e.g. JAVA_DEV"
          />
          
          <Input
            label="Skill Name"
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            error={formErrors.name}
            placeholder="e.g. Java Development"
          />

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-textarea"
              rows={3}
            />
          </div>

          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading} isLoading={loading}>
              {loading ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Skill')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
