import React, { useEffect, useState } from 'react';
import { SkillApi } from '../services/SkillApi';
import type { Skill } from '../types/skill';
import { BookOpen, Plus, Search, Edit2, CheckCircle, XCircle } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../components/Table';
import { LoadingState, EmptyState } from '../components/FeedbackStates';
import { StatusBadge } from '../components/StatusBadge';
import { SkillModal } from '../components/SkillModal';
import { IconButton } from '../components/IconButton';

export const SkillsPage: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const size = 20;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { user } = useAuth();

  const canManage = user?.permissions.includes('SKILL_CATALOG_MANAGE');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const loadSkills = async (currentSearch = '', currentPage = 0, currentSize = 20) => {
    try {
      setLoading(true);
      const data = await SkillApi.search(currentSearch, undefined, currentPage, currentSize);
      setSkills(data.content || []);
    } catch (error) {
      console.error('Failed to load skills', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSkills(debouncedSearch, page, size);
  }, [debouncedSearch, page, size]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedSearch(searchTerm);
    setPage(0);
  };

  const handleAddSkill = () => {
    setSelectedSkill(null);
    setIsModalOpen(true);
  };

  const handleEditSkill = (skill: Skill) => {
    setSelectedSkill(skill);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await SkillApi.toggleStatus(id);
      showSuccess('Skill status updated successfully');
      loadSkills(debouncedSearch, page, size);
    } catch (error) {
      console.error('Failed to toggle status', error);
      alert('Failed to update skill status');
    }
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    showSuccess(selectedSkill ? 'Skill updated successfully' : 'Skill created successfully');
    loadSkills(debouncedSearch, page, size);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <PageHeader 
        title={<><BookOpen size={24} className="inline-icon text-blue-600" /> Skills Directory</>}
        description="Manage the global list of employee skills."
        actionButton={{
          label: 'Add Skill',
          show: canManage,
          onClick: handleAddSkill,
          icon: <Plus size={16} />
        }}
      />

      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-md flex items-center gap-2">
          <CheckCircle size={20} />
          <span>{successMessage}</span>
        </div>
      )}

      <Card>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <h2 className="text-lg font-semibold text-gray-900">Skill List</h2>
          
          <form onSubmit={handleSearchSubmit} className="w-full md:w-64 relative">
            <input
              type="text"
              placeholder="Search by skill code or name..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="form-input w-full"
            />
          </form>
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
          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Code</TableHeader>
                  <TableHeader>Name</TableHeader>
                  <TableHeader>Status</TableHeader>
                  {canManage && <TableHeader align="right">Actions</TableHeader>}
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
                    {canManage && (
                      <TableCell align="right">
                        <div className="flex justify-end gap-2">
                          <IconButton 
                            icon={<Edit2 size={16} />} 
                            title="Edit Skill"
                            onClick={() => handleEditSkill(skill)}
                          />
                          <IconButton 
                            icon={skill.active ? <XCircle size={16} /> : <CheckCircle size={16} />} 
                            title={skill.active ? "Deactivate" : "Activate"}
                            onClick={() => handleToggleStatus(skill.id)}
                          />
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <SkillModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        skill={selectedSkill}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};
