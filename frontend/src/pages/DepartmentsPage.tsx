import React, { useEffect, useState } from 'react';
import { DepartmentApi } from '../services/DepartmentApi';
import type { Department } from '../types/department';
import { Building2, Plus, Search, Eye, RefreshCw } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../components/Table';
import { StatusBadge } from '../components/StatusBadge';
import { IconButton } from '../components/IconButton';
import { FilterBar } from '../components/FilterBar';
import { Input, Select } from '../components/Forms';
import { Button } from '../components/Button';
import { LoadingState, EmptyState } from '../components/FeedbackStates';

export const DepartmentsPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  const navigate = useNavigate();
  const { user } = useAuth();



  const loadDepartments = async () => {
    try {
      setLoading(true);
      const data = await DepartmentApi.search();
      setDepartments(data.content || []);
    } catch (error) {
      console.error('Failed to load departments', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDepartments();
  }, []);

  const filteredDepartments = departments.filter(dept => {
    const matchesSearch = dept.name.toLowerCase().includes(search.toLowerCase()) || dept.code.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || (statusFilter === 'ACTIVE' && dept.active) || (statusFilter === 'INACTIVE' && !dept.active);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <PageHeader
        title="Departments"
        description="Manage company organizational structure."
        icon={<Building2 size={24} />}
        actionButton={{
          label: 'Add Department',
          show: !!user?.permissions.includes('DEPARTMENT_WRITE'),
          onClick: () => navigate('/departments/new'),
          icon: <Plus size={16} />
        }}
      />

      <FilterBar>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <Input 
            placeholder="Search departments..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ width: '200px' }}>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </Select>
        </div>
        <Button variant="ghost" onClick={loadDepartments} isLoading={loading}>
          <RefreshCw size={16} style={{ marginRight: '8px' }} /> Refresh
        </Button>
      </FilterBar>

      <Card>
        {loading ? (
          <LoadingState message="Loading departments..." />
        ) : filteredDepartments.length === 0 ? (
          <EmptyState 
            icon={<Search size={48} />}
            title="No departments found" 
            message="No departments match your search criteria." 
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Code</TableHeader>
                  <TableHeader>Name</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Employees</TableHeader>
                  <TableHeader>Active HOD</TableHeader>
                  <TableHeader align="right">Actions</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDepartments.map(dept => (
                  <TableRow key={dept.id}>
                    <TableCell className="font-medium text-gray-900">{dept.code}</TableCell>
                    <TableCell>{dept.name}</TableCell>
                    <TableCell>
                      <StatusBadge status={dept.active ? 'Active' : 'Inactive'} />
                    </TableCell>
                    <TableCell>{dept.employeeCount}</TableCell>
                    <TableCell>{dept.activeHod ? `${dept.activeHod.firstName} ${dept.activeHod.lastName}` : <span className="text-gray-500">Not Assigned</span>}</TableCell>
                    <TableCell align="right">
                      <IconButton 
                        icon={<Eye size={16} />} 
                        onClick={() => navigate(`/departments/${dept.id}`)}
                        title="View Details"
                        aria-label="View Details"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div >
  );
};
