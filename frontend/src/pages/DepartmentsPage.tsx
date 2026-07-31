import React, { useEffect, useState } from 'react';
import { DepartmentApi } from '../services/DepartmentApi';
import type { Department } from '../types/department';
import { Building, Plus, Search } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../components/Table';
import { LoadingState, EmptyState } from '../components/FeedbackStates';
import { StatusBadge } from '../components/StatusBadge';

export const DepartmentsPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  const canCreate = user?.permissions.includes('DEPARTMENT_CREATE');

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

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <PageHeader
        title={<><Building size={24} className="inline-icon text-blue-600" /> Departments</>}
        description="Manage company departments and their heads."
        actionButton={{
          label: 'Add Department',
          show: canCreate,
          onClick: () => navigate('/departments/new'),
          icon: <Plus size={16} />
        }}
      />

      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Department List</h2>
        </div>
        <div className="card-body">
          {loading ? (
            <p>Loading departments...</p>
          ) : departments.length === 0 ? (
            <p>No departments found.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Employees</th>
                </tr>
              </thead>
              <tbody>
                {departments.map(dept => (
                  <tr key={dept.id}>
                    <td>{dept.code}</td>
                    <td>{dept.name}</td>
                    <td>{dept.active ? 'Active' : 'Inactive'}</td>
                    <td>{dept.employeeCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div >
  );
};
