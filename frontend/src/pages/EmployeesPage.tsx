import React, { useEffect, useState } from 'react';
import { EmployeeApi } from '../services/EmployeeApi';
import { DepartmentApi } from '../services/DepartmentApi';
import type { Employee } from '../types/employee';
import type { Department } from '../types/department';
import { ContactRound, Eye, Plus, Search, RefreshCw } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../components/Table';
import { LoadingState, EmptyState } from '../components/FeedbackStates';
import { StatusBadge } from '../components/StatusBadge';
import { IconButton } from '../components/IconButton';
import { FilterBar } from '../components/FilterBar';
import { Input, Select } from '../components/Forms';
import { Button } from '../components/Button';

export const EmployeesPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  
  const navigate = useNavigate();
  const { user } = useAuth();

  const canCreate = user?.permissions.includes('EMPLOYEE_CREATE');

  const loadData = async () => {
    try {
      setLoading(true);
      const [empData, deptData] = await Promise.all([
        EmployeeApi.search(),
        DepartmentApi.search()
      ]);
      setEmployees(empData.content || []);
      setDepartments(deptData.content || []);
    } catch (error) {
      console.error('Failed to load employee data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, []);

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      (emp.firstName?.toLowerCase() || '').includes(search.toLowerCase()) || 
      (emp.lastName?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (emp.employeeNumber?.toLowerCase() || '').includes(search.toLowerCase());
    
    const matchesDept = deptFilter ? emp.department?.id === deptFilter : true;
    const matchesType = typeFilter ? emp.employmentType === typeFilter : true;
    const matchesStatus = statusFilter === 'ALL' ? true : emp.employmentStatus === statusFilter;
    
    return matchesSearch && matchesDept && matchesType && matchesStatus;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <PageHeader 
        title="Employees"
        description="Manage employee records, skills, qualifications, and leaves."
        icon={<ContactRound size={24} />}
        actionButton={{
          label: 'Add Employee',
          show: canCreate,
          onClick: () => navigate('/employees/new'),
          icon: <Plus size={16} />
        }}
      />

      <FilterBar>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <Input 
            placeholder="Search by name or ID..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ width: '180px' }}>
          <Select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
            <option value="">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </Select>
        </div>
        <div style={{ width: '160px' }}>
          <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All Types</option>
            <option value="FULL_TIME">Full Time</option>
            <option value="PART_TIME">Part Time</option>
            <option value="CONTRACT">Contract</option>
            <option value="INTERN">Intern</option>
          </Select>
        </div>
        <div style={{ width: '160px' }}>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="TERMINATED">Terminated</option>
          </Select>
        </div>
        <Button variant="ghost" onClick={loadData} isLoading={loading}>
          <RefreshCw size={16} style={{ marginRight: '8px' }} /> Refresh
        </Button>
      </FilterBar>

      <Card>
        {loading ? (
          <LoadingState message="Loading employees..." />
        ) : filteredEmployees.length === 0 ? (
          <EmptyState 
            icon={<Search size={48} />}
            title="No employees found" 
            message="No employees match your criteria." 
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Number</TableHeader>
                  <TableHeader>Name</TableHeader>
                  <TableHeader>Department</TableHeader>
                  <TableHeader>Job Title</TableHeader>
                  <TableHeader>Type</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader align="right">Actions</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEmployees.map(emp => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-medium">{emp.employeeNumber}</TableCell>
                    <TableCell>
                      <div className="font-medium text-gray-900">{emp.firstName} {emp.lastName}</div>
                      <div className="text-gray-500 text-xs">{emp.workEmail}</div>
                    </TableCell>
                    <TableCell>{emp.department?.name || 'N/A'}</TableCell>
                    <TableCell>{emp.jobTitle}</TableCell>
                    <TableCell>
                      <StatusBadge status={emp.employmentType} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={emp.employmentStatus} />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton 
                        onClick={() => navigate(`/employees/${emp.id}`)} 
                        title="View Details" 
                        aria-label="View Details"
                        icon={<Eye size={16} />}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
};
