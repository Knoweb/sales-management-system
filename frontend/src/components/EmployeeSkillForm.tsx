import React, { useState } from 'react';
import { Button } from './Button';
import { Select } from './Forms';
import type { Skill } from '../types/skill';
import { SkillApi } from '../services/SkillApi';

interface EmployeeSkillFormProps {
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (data: any) => Promise<void>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: any;
}

export const EmployeeSkillForm: React.FC<EmployeeSkillFormProps> = ({ onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    skillId: initialData?.skill?.id || '',
    proficiencyLevel: initialData?.proficiencyLevel || 'BEGINNER',
    yearsOfExperience: initialData?.yearsOfExperience || '',
    verified: initialData?.verified || false,
    notes: initialData?.notes || ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [skills, setSkills] = useState<Skill[]>([]);
  const isEdit = !!initialData;
  const isNew = !isEdit;

  React.useEffect(() => {
    if (isNew) {
      SkillApi.search(undefined, true, 0, 100).then(data => {
        setSkills(data.content);
      }).catch(err => console.error('Failed to load skills', err));
    }
  }, [isNew]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (isNew && !formData.skillId) {
      setError('Please select a skill');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        skillId: formData.skillId,
        proficiencyLevel: formData.proficiencyLevel,
        yearsOfExperience: formData.yearsOfExperience === '' ? undefined : Number(formData.yearsOfExperience),
        verified: formData.verified,
        notes: formData.notes
      });
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save skill');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">{isNew ? 'Add Skill' : 'Edit Skill'}</h2>
        </div>
        
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded" style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error)' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          {isNew && (
            <Select
              label="Skill"
              value={formData.skillId}
              onChange={(e) => setFormData({ ...formData, skillId: e.target.value })}
              required
            >
              <option value="">Select a skill</option>
              {skills.map(skill => (
                <option key={skill.id} value={skill.id}>
                  {skill.name}
                </option>
              ))}
            </Select>
          )}
          
          <Select
            label="Proficiency Level"
            value={formData.proficiencyLevel}
            onChange={(e) => setFormData({ ...formData, proficiencyLevel: e.target.value as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT' })}
            required
          >
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
            <option value="EXPERT">Expert</option>
          </Select>
          
          <div className="form-group">
            <label className="form-label">Years of Experience</label>
            <input 
              type="number" 
              className="form-input"
              value={formData.yearsOfExperience}
              onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value === '' ? '' : Number(e.target.value) })}
              min="0"
              step="0.5"
            />
          </div>
          
          <div className="form-group">
            <label className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input 
                type="checkbox" 
                checked={formData.verified}
                onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
              />
              <span className="form-label" style={{ marginBottom: 0 }}>Verified</span>
            </label>
          </div>
          
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea 
              className="form-textarea"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Skill'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
