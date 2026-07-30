import React, { useEffect, useState } from 'react';
import { EmployeeApi } from '../services/EmployeeApi';
import type { Employee } from '../types/employee';
import { Users } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
    <div className="page-container">
      <PageHeader 
        title={<><Users size={24} className="inline-icon" /> Employees</>}
        description="Manage employee records, skills, qualifications, and leaves."
        actionButton={{
          label: 'Add Employee',
          show: canCreate,
          onClick: () => navigate('/employees/new')
        }}
      />

      <div className="card">
        <div className="card-header flex-between">
          <h2 className="card-title">Employee Directory</h2>
        </div>
        <div className="card-body">
          {loading ? (
            <p>Loading employees...</p>
          ) : employees.length === 0 ? (
            <p>No employees found.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Number</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Job Title</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.id}>
                    <td>{emp.employeeNumber}</td>
                    <td>{emp.firstName} {emp.lastName}</td>
                    <td>{emp.department?.name || 'N/A'}</td>
                    <td>{emp.jobTitle}</td>
                    <td>
                      <span className={`badge badge-${emp.employmentStatus === 'ACTIVE' ? 'green' : 'red'}`}>
                        {emp.employmentStatus}
                      </span>
                    </td>
                    <td>
                      <Link to={`/employees/${emp.id}`} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>View</Link>
                    </td>
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
