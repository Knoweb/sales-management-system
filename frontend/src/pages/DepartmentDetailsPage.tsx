import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserCheck, ShieldAlert, Building2 } from 'lucide-react';
import { DepartmentApi } from '../services/DepartmentApi';
import { EmployeeApi } from '../services/EmployeeApi';
import type { Department } from '../types/department';
import type { Employee } from '../types/employee';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../components/Table';
import { Button } from '../components/Button';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingState, ErrorState } from '../components/FeedbackStates';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import { FormField, Select } from '../components/Forms';
import { Alert } from '../components/Alert';

export const DepartmentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [department, setDepartment] = useState<Department | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Assignment Modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isAdmin = user?.roles.includes('SYSTEM_ADMIN');

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      
      const deptData = await DepartmentApi.getById(id);
      setDepartment(deptData);

      // Search active employees in this department
      const empData = await EmployeeApi.search(undefined, id, 'ACTIVE');
      setEmployees(empData.content || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load department details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  const handleAssignHead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !selectedEmployeeId) return;

    try {
      setAssignLoading(true);
      setAssignError(null);
      setSuccessMessage(null);
      
      await DepartmentApi.assignHead(id, { employeeId: selectedEmployeeId });
      
      setSuccessMessage('Department Head assigned successfully.');
      setIsAssignModalOpen(false);
      loadData();
    } catch (err: unknown) {
      console.error(err);
      if (axios.isAxiosError(err)) {
        setAssignError(err.response?.data?.message || 'Failed to assign Department Head.');
      } else {
        setAssignError('Failed to assign Department Head.');
      }
    } finally {
      setAssignLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto w-full">
        <LoadingState message="Loading department details..." />
      </div>
    );
  }

  if (error || !department) {
    return (
      <div className="p-6 max-w-7xl mx-auto w-full">
        <ErrorState message={error || 'Department not found'} onRetry={loadData} />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate('/departments')}>
          <ArrowLeft size={16} style={{ marginRight: '8px' }} /> Back to Departments
        </Button>
      </div>

      <PageHeader
        title={`Department: ${department.name}`}
        description={`Code: ${department.code}`}
        icon={<Building2 size={24} />}
      />

      {successMessage && (
        <Alert variant="success">
          {successMessage}
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Info Card */}
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Details</h3>
          <div className="space-y-2">
            <div>
              <span className="text-sm font-semibold text-gray-500">Name:</span>
              <p className="text-gray-900">{department.name}</p>
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-500">Code:</span>
              <p className="text-gray-900">{department.code}</p>
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-500">Description:</span>
              <p className="text-gray-900">{department.description || 'No description provided'}</p>
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-500">Status:</span>
              <div>
                <StatusBadge status={department.active ? 'Active' : 'Inactive'} />
              </div>
            </div>
          </div>
        </Card>

        {/* HOD Card */}
        <Card className="p-6 space-y-4 md:col-span-2">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="text-lg font-medium text-gray-900">Active Department Head (HOD)</h3>
            {isAdmin && department.active && (
              <Button 
                variant="primary" 
                onClick={() => {
                  setSelectedEmployeeId(department.activeHod?.id || '');
                  setAssignError(null);
                  setIsAssignModalOpen(true);
                }}
              >
                <UserCheck size={16} style={{ marginRight: '8px' }} /> Assign HOD
              </Button>
            )}
          </div>

          {department.activeHod ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-semibold text-gray-500">HOD Name:</span>
                <p className="text-gray-900 font-medium">{department.activeHod.firstName} {department.activeHod.lastName}</p>
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-500">Employee Number:</span>
                <p className="text-gray-900">{department.activeHod.employeeNumber}</p>
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-500">Job Title:</span>
                <p className="text-gray-900">{department.activeHod.jobTitle}</p>
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-500">Work Email:</span>
                <p className="text-gray-900">{department.activeHod.workEmail}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-gray-500">
              <ShieldAlert size={36} className="mb-2 text-gray-400" />
              <p>No active Department Head assigned.</p>
              {!isAdmin && <p className="text-sm">Admin access required to assign.</p>}
            </div>
          )}
        </Card>
      </div>

      {/* Employees Table */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Active Employees</h3>
        {employees.length === 0 ? (
          <p className="text-gray-500 py-4 text-center">No active employees found in this department.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Emp No</TableHeader>
                  <TableHeader>Name</TableHeader>
                  <TableHeader>Job Title</TableHeader>
                  <TableHeader>Email</TableHeader>
                  <TableHeader>Role</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.map(emp => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-medium text-gray-900">{emp.employeeNumber}</TableCell>
                    <TableCell>{emp.firstName} {emp.lastName}</TableCell>
                    <TableCell>{emp.jobTitle}</TableCell>
                    <TableCell>{emp.workEmail || '-'}</TableCell>
                    <TableCell>
                      {emp.departmentHead ? <StatusBadge status="HOD" /> : <span className="text-gray-500">Staff</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Assign HOD Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => !assignLoading && setIsAssignModalOpen(false)}
        title="Assign Department Head"
        maxWidth="500px"
      >
        <form onSubmit={handleAssignHead} className="space-y-4">
          {assignError && (
            <Alert variant="error">
              {assignError}
            </Alert>
          )}

          <FormField label="Select Employee" required id="employeeSelect">
            <Select
              id="employeeSelect"
              value={selectedEmployeeId}
              onChange={e => setSelectedEmployeeId(e.target.value)}
              disabled={assignLoading}
              required
            >
              <option value="">-- Choose active employee --</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} ({emp.employeeNumber})
                </option>
              ))}
            </Select>
          </FormField>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsAssignModalOpen(false)} disabled={assignLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={assignLoading} disabled={!selectedEmployeeId}>
              Confirm Assignment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
