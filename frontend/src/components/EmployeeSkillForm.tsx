import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { ProficiencyLevel, Skill } from '../types/skill';
import { SkillApi } from '../services/SkillApi';

interface EmployeeSkillFormProps {
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (data: any) => Promise<void>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: any;
}

export const EmployeeSkillForm: React.FC<EmployeeSkillFormProps> = ({ onClose, onSubmit, initialData }) => {
  const [skillId, setSkillId] = useState(initialData?.skill?.id || '');
  const [proficiencyLevel, setProficiencyLevel] = useState<ProficiencyLevel>(initialData?.proficiencyLevel || 'BEGINNER');
  const [yearsOfExperience, setYearsOfExperience] = useState<number | ''>(initialData?.yearsOfExperience || '');
  const [verified, setVerified] = useState<boolean>(initialData?.verified || false);
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [skills, setSkills] = useState<Skill[]>([]);
  const isEdit = !!initialData;

  React.useEffect(() => {
    if (!isEdit) {
      SkillApi.search(undefined, true, 0, 100).then(data => {
        setSkills(data.content);
      }).catch(err => console.error('Failed to load skills', err));
    }
  }, [isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!isEdit && !skillId) {
      setError('Please select a skill');
      return;
    }

    const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!isEdit && !UUID_PATTERN.test(skillId)) {
      setError('Please select a valid skill.');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        skillId,
        proficiencyLevel,
        yearsOfExperience: yearsOfExperience === '' ? undefined : Number(yearsOfExperience),
        verified,
        notes
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
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit Skill' : 'Add Skill'}</h2>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded" style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error)' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          {!isEdit && (
            <div className="form-group">
              <label className="form-label">Skill</label>
              <select 
                className="form-select"
                value={skillId}
                onChange={(e) => setSkillId(e.target.value)}
                required
              >
                <option value="">Select a skill</option>
                {skills.map((skill) => (
                  <option key={skill.id} value={skill.id}>
                    {skill.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div className="form-group">
            <label className="form-label">Proficiency Level</label>
            <select 
              className="form-select"
              value={proficiencyLevel}
              onChange={(e) => setProficiencyLevel(e.target.value as ProficiencyLevel)}
            >
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
              <option value="EXPERT">Expert</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Years of Experience</label>
            <input 
              type="number" 
              className="form-input"
              value={yearsOfExperience}
              onChange={(e) => setYearsOfExperience(e.target.value === '' ? '' : Number(e.target.value))}
              min="0"
              step="0.5"
            />
          </div>
          
          <div className="form-group">
            <label className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input 
                type="checkbox" 
                checked={verified}
                onChange={(e) => setVerified(e.target.checked)}
              />
              <span className="form-label" style={{ marginBottom: 0 }}>Verified</span>
            </label>
          </div>
          
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea 
              className="form-textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Skill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
