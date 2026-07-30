import React, { useEffect, useState } from 'react';
import { SkillApi } from '../services/SkillApi';
import type { Skill } from '../types/skill';
import { BookOpen } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const SkillsPage: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  const canCreate = user?.permissions.includes('SYSTEM_ADMIN'); // Skills are managed by SYSTEM_ADMIN

  const loadSkills = async () => {
    try {
      setLoading(true);
      const data = await SkillApi.search();
      setSkills(data.content || []);
    } catch (error) {
      console.error('Failed to load skills', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSkills();
  }, []);

  return (
    <div className="page-container">
      <PageHeader 
        title={<><BookOpen size={24} className="inline-icon" /> Skills Directory</>}
        description="Manage the global list of employee skills."
        actionButton={{
          label: 'Add Skill',
          show: canCreate,
          onClick: () => navigate('/skills/new')
        }}
      />

      <div className="card">
        <div className="card-header flex-between">
          <h2 className="card-title">Skill List</h2>
        </div>
        <div className="card-body">
          {loading ? (
            <p>Loading skills...</p>
          ) : skills.length === 0 ? (
            <p>No skills found.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {skills.map(skill => (
                  <tr key={skill.id}>
                    <td>{skill.code}</td>
                    <td>{skill.name}</td>
                    <td>{skill.active ? 'Active' : 'Inactive'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
