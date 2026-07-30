import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmployeeApi } from '../services/EmployeeApi';
import { DepartmentApi } from '../services/DepartmentApi';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';
import type { CreateEmployeeRequest } from '../types/employee';
import type { Department } from '../types/department';

export const EmployeeFormPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateEmployeeRequest>({
    employeeNumber: '',
    departmentId: '',
    firstName: '',
    lastName: '',
    workEmail: '',
    personalEmail: '',
    contactNumber: '',
    jobTitle: '',
    employmentType: 'FULL_TIME',
    hireDate: '',
    weeklyCapacityHours: 40
  });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const data = await DepartmentApi.search();
        setDepartments(data.content || []);
      } catch (err) {
        console.error('Failed to load departments', err);
      }
    };
    fetchDepartments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = { ...formData };
      if (!payload.workEmail) delete payload.workEmail;
      if (!payload.personalEmail) delete payload.personalEmail;
      if (!payload.contactNumber) delete payload.contactNumber;
      if (!payload.hireDate) delete payload.hireDate;
      
      await EmployeeApi.create(payload);
      navigate('/employees');
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to create employee');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  return (
    <div className="page-container">
      <PageHeader 
        title="Create Employee"
        description="Add a new employee record."
      />

      <div className="card" style={{ maxWidth: '800px' }}>
        <div className="card-body">
          {error && <div className="error-message" style={{ color: 'var(--error)', marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'var(--error-bg)', borderRadius: 'var(--radius-md)' }}>{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Employee Number *</label>
                <input
                  type="text"
                  name="employeeNumber"
                  value={formData.employeeNumber}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Department *</label>
                <select
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                >
                  <option value="">Select Department</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Work Email</label>
                <input
                  type="email"
                  name="workEmail"
                  value={formData.workEmail}
                  onChange={handleChange}
                  disabled={loading}
                  style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Contact Number</label>
                <input
                  type="text"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  disabled={loading}
                  style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Job Title *</label>
                <input
                  type="text"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Employment Type *</label>
                <select
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                >
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERN">Intern</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Hire Date</label>
                <input
                  type="date"
                  name="hireDate"
                  value={formData.hireDate}
                  onChange={handleChange}
                  disabled={loading}
                  style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Weekly Capacity (Hours)</label>
                <input
                  type="number"
                  name="weeklyCapacityHours"
                  value={formData.weeklyCapacityHours}
                  onChange={handleChange}
                  disabled={loading}
                  style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                />
              </div>
            </div>

            <div className="flex-between" style={{ justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
              <Button type="button" variant="ghost" onClick={() => navigate('/employees')} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={loading}>
                Save Employee
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
