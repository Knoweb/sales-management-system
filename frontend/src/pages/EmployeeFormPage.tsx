import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmployeeApi } from '../services/EmployeeApi';
import { DepartmentApi } from '../services/DepartmentApi';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { FormField, Input, Select } from '../components/Forms';
import { SectionHeader } from '../components/SectionHeader';
import { Alert } from '../components/Alert';
import type { CreateEmployeeRequest } from '../types/employee';
import type { Department } from '../types/department';

import { ContactRound } from 'lucide-react';

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
    <div className="p-6 max-w-7xl mx-auto w-full">
      <PageHeader 
        title="Create Employee"
        description="Add a new employee record."
        icon={<ContactRound size={24} />}
      />

      <div style={{ maxWidth: '800px' }}>
        <Card>
          {error && (
            <Alert variant="error" style={{ marginBottom: '1.5rem' }}>
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <SectionHeader title="Personal Information" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <FormField label="First Name" required id="firstName">
                <Input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </FormField>

              <FormField label="Last Name" required id="lastName">
                <Input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </FormField>
            </div>

            <SectionHeader title="Employment Information" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <FormField label="Employee Number" required id="employeeNumber">
                <Input
                  type="text"
                  id="employeeNumber"
                  name="employeeNumber"
                  value={formData.employeeNumber}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </FormField>

              <FormField label="Department" required id="departmentId">
                <Select
                  id="departmentId"
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="">Select Department</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </Select>
              </FormField>

              <FormField label="Job Title" required id="jobTitle">
                <Input
                  type="text"
                  id="jobTitle"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </FormField>

              <FormField label="Employment Type" required id="employmentType">
                <Select
                  id="employmentType"
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERN">Intern</option>
                </Select>
              </FormField>

              <FormField label="Hire Date" id="hireDate">
                <Input
                  type="date"
                  id="hireDate"
                  name="hireDate"
                  value={formData.hireDate}
                  onChange={handleChange}
                  disabled={loading}
                />
              </FormField>
            </div>

            <SectionHeader title="Contact Information" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <FormField label="Work Email" id="workEmail">
                <Input
                  type="email"
                  id="workEmail"
                  name="workEmail"
                  value={formData.workEmail}
                  onChange={handleChange}
                  disabled={loading}
                />
              </FormField>

              <FormField label="Contact Number" id="contactNumber">
                <Input
                  type="text"
                  id="contactNumber"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  disabled={loading}
                />
              </FormField>
            </div>

            <SectionHeader title="Capacity and Notes" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <FormField label="Weekly Capacity (Hours)" id="weeklyCapacityHours">
                <Input
                  type="number"
                  id="weeklyCapacityHours"
                  name="weeklyCapacityHours"
                  value={formData.weeklyCapacityHours}
                  onChange={handleChange}
                  disabled={loading}
                />
              </FormField>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
              <Button type="button" variant="ghost" onClick={() => navigate('/employees')} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={loading}>
                Save Employee
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
