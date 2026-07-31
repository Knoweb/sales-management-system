import React, { useEffect, useState } from 'react';
import { DepartmentApi } from '../services/DepartmentApi';
import type { Department } from '../types/department';
import { Building } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
    <div className="page-container">
      <PageHeader 
        title={<><Building size={24} className="inline-icon" /> Departments</>}
        description="Manage company departments and their heads."
        actionButton={{
          label: 'Add Department',
          show: canCreate,
          onClick: () => navigate('/departments/new')
        }}
      />

      <div className="card">
        <div className="card-header flex-between">
          <h2 className="card-title">Department List</h2>
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
                    <td>{dept.employeeCount ?? 0}</td>
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
