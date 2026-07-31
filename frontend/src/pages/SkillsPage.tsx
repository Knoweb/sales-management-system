import React, { useEffect, useState } from 'react';
import { SkillApi } from '../services/SkillApi';
import type { Skill } from '../types/skill';
import { BadgeCheck, Plus, Search, Edit2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../components/Table';
import { LoadingState, EmptyState } from '../components/FeedbackStates';
import { StatusBadge } from '../components/StatusBadge';
import { SkillModal } from '../components/SkillModal';
import { IconButton } from '../components/IconButton';
import { FilterBar } from '../components/FilterBar';
import { Input, Select } from '../components/Forms';
import { Button } from '../components/Button';
import { Alert } from '../components/Alert';

export const SkillsPage: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
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

  const filteredSkills = skills.filter(skill => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'ACTIVE') return skill.active;
    if (statusFilter === 'INACTIVE') return !skill.active;
    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <PageHeader 
        title="Skills Directory"
        description="Manage the global list of employee skills."
        icon={<BadgeCheck size={24} />}
        actionButton={{
          label: 'Add Skill',
          show: canManage,
          onClick: handleAddSkill,
          icon: <Plus size={16} />
        }}
      />

      {successMessage && (
        <Alert variant="success" style={{ marginBottom: '1.5rem' }}>
          {successMessage}
        </Alert>
      )}

      <FilterBar>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <Input 
            placeholder="Search by skill code or name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ width: '200px' }}>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </Select>
        </div>
        <Button variant="ghost" onClick={() => loadSkills(debouncedSearch, page, size)} isLoading={loading}>
          <RefreshCw size={16} style={{ marginRight: '8px' }} /> Refresh
        </Button>
      </FilterBar>

      <Card>
        {loading ? (
          <LoadingState message="Loading skills..." />
        ) : filteredSkills.length === 0 ? (
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
                {filteredSkills.map(skill => (
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

      {isModalOpen && (
        <SkillModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          skill={selectedSkill}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
};
