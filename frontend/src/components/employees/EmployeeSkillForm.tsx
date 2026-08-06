import React, { useState } from 'react';
import { Button } from '../Button';
import { FormField, Input, Select, Textarea, Checkbox } from '../Forms';
import { Modal } from '../Modal';
import { Alert } from '../Alert';
import type { Skill } from '../../types/skill';
import { SkillApi } from '../../services/SkillApi';

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
    <Modal 
      isOpen={true} 
      onClose={() => !loading && onClose()} 
      title={isNew ? 'Add Skill' : 'Edit Skill'}
    >
      {error && (
        <Alert variant="error" style={{ marginBottom: '1.5rem' }}>
          {error}
        </Alert>
      )}
      
      <form onSubmit={handleSubmit}>
        {isNew && (
          <div style={{ marginBottom: '1.5rem' }}>
            <FormField label="Skill" required id="skillId">
              <Select
                id="skillId"
                value={formData.skillId}
                onChange={(e) => setFormData({ ...formData, skillId: e.target.value })}
                required
                disabled={loading}
              >
                <option value="">Select a skill</option>
                {skills.map(skill => (
                  <option key={skill.id} value={skill.id}>
                    {skill.name}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>
        )}
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <FormField label="Proficiency Level" required id="proficiencyLevel">
            <Select
              id="proficiencyLevel"
              value={formData.proficiencyLevel}
              onChange={(e) => setFormData({ ...formData, proficiencyLevel: e.target.value as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT' })}
              required
              disabled={loading}
            >
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
              <option value="EXPERT">Expert</option>
            </Select>
          </FormField>
          
          <FormField label="Years of Experience" id="yearsOfExperience">
            <Input 
              id="yearsOfExperience"
              type="number" 
              value={formData.yearsOfExperience}
              onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value === '' ? '' : Number(e.target.value) })}
              min="0"
              step="0.5"
              disabled={loading}
            />
          </FormField>
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <Checkbox 
            id="verified"
            label="Verified"
            checked={formData.verified}
            onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
            disabled={loading}
          />
        </div>
        
        <div style={{ marginBottom: '2rem' }}>
          <FormField label="Notes" id="notes">
            <Textarea 
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
            {isNew ? 'Add Skill' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
