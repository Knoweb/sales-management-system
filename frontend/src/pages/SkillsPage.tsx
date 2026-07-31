import React, { useEffect, useState } from 'react';
import { SkillApi } from '../services/SkillApi';
import type { Skill } from '../types/skill';
import { BookOpen, Plus, Search } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../components/Table';
import { LoadingState, EmptyState } from '../components/FeedbackStates';
import { StatusBadge } from '../components/StatusBadge';

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
    <div className="p-6 max-w-7xl mx-auto w-full">
      <PageHeader 
        title={<><BookOpen size={24} className="inline-icon text-blue-600" /> Skills Directory</>}
        description="Manage the global list of employee skills."
        actionButton={{
          label: 'Add Skill',
          show: canCreate,
          onClick: () => navigate('/skills/new'),
          icon: <Plus size={16} />
        }}
      />

      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Skill List</h2>
        </div>
        
        {loading ? (
          <LoadingState message="Loading skills..." />
        ) : skills.length === 0 ? (
          <EmptyState 
            icon={<Search size={48} />}
            title="No skills found" 
            message="No skills match your criteria." 
          />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Code</TableHeader>
                <TableHeader>Name</TableHeader>
                <TableHeader>Status</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {skills.map(skill => (
                <TableRow key={skill.id}>
                  <TableCell className="font-medium text-gray-900">{skill.code}</TableCell>
                  <TableCell>{skill.name}</TableCell>
                  <TableCell>
                    <StatusBadge 
                      status={skill.active ? 'Active' : 'Inactive'} 
                      variant={skill.active ? 'success' : 'neutral'} 
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
};
