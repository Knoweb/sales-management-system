import React, { useEffect, useState } from 'react';
import { EmployeeApi } from '../services/EmployeeApi';
import type { Employee } from '../types/employee';
import { Users, Eye, Plus, Search } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../components/Table';
import { LoadingState, EmptyState } from '../components/FeedbackStates';
import { StatusBadge } from '../components/StatusBadge';
import { IconButton } from '../components/IconButton';

export const EmployeesPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  const canCreate = user?.permissions.includes('EMPLOYEE_CREATE');

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await EmployeeApi.search();
      setEmployees(data.content || []);
    } catch (error) {
      console.error('Failed to load employees', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadEmployees();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <PageHeader 
        title={<><Users size={24} className="inline-icon text-blue-600" /> Employees</>}
        description="Manage employee records, skills, qualifications, and leaves."
        actionButton={{
          label: 'Add Employee',
          show: canCreate,
          onClick: () => navigate('/employees/new'),
          icon: <Plus size={16} />
        }}
      />

      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Employee Directory</h2>
        </div>
        
        {loading ? (
          <LoadingState message="Loading employees..." />
        ) : employees.length === 0 ? (
          <EmptyState 
            icon={<Search size={48} />}
            title="No employees found" 
            message="No employees match your criteria." 
          />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Number</TableHeader>
                <TableHeader>Name</TableHeader>
                <TableHeader>Department</TableHeader>
                <TableHeader>Job Title</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader align="right">Actions</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map(emp => (
                <TableRow key={emp.id}>
                  <TableCell className="font-medium">{emp.employeeNumber}</TableCell>
                  <TableCell>{emp.firstName} {emp.lastName}</TableCell>
                  <TableCell>{emp.department?.name || 'N/A'}</TableCell>
                  <TableCell>{emp.jobTitle}</TableCell>
                  <TableCell>
                    <StatusBadge status={emp.employmentStatus} />
                  </TableCell>
                  <TableCell align="right">
                    <div className="flex justify-end">
                      <IconButton onClick={() => navigate(`/employees/${emp.id}`)} title="View Details" aria-label="View Details">
                        <Eye size={16} />
                      </IconButton>
                    </div>
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
