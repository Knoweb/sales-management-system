import React, { useEffect, useState, type FormEvent } from 'react';
import { EmployeeApi } from '../../services/EmployeeApi';
import { DepartmentApi } from '../../services/DepartmentApi';
import type { Employee, UpdateEmployeeRequest, CreateEmployeeRequest } from '../../types/employee';
import type { Department } from '../../types/department';
import {
  ContactRound,
  Eye,
  Plus,
  Edit2,
  X,
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/Card';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
} from '../../components/Table';
import {
  LoadingState,
  EmptyState,
} from '../../components/FeedbackStates';
import { StatusBadge } from '../../components/StatusBadge';
import { IconButton } from '../../components/IconButton';
import { Input, Select, FormField } from '../../components/Forms';
import { Modal } from '../../components/Modal';
import { Alert } from '../../components/Alert';
import { Button } from '../../components/Button';
import { SectionHeader } from '../../components/SectionHeader';
import { apiClient } from '../../services/Api';

interface SimpleUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface EmployeeFormFieldsProps {
  formData: any;
  updateFormField: (field: string, value: string | number) => void;
  formLoading: boolean;
  departments: Department[];
  usersToDisplay: SimpleUser[];
  employeeNumberDisabled: boolean;
  employeeNumberValue: string;
  hasGlobalAccess: boolean;
}

const EmployeeFormFields: React.FC<EmployeeFormFieldsProps> = ({
  formData,
  updateFormField,
  formLoading,
  departments,
  usersToDisplay,
  employeeNumberDisabled,
  employeeNumberValue,
  hasGlobalAccess
}) => {
  return (
    <>
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingRight: '0.5rem' }}>
        <div style={{ marginBottom: '0.75rem' }}>
          <SectionHeader title="Personal Information" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', columnGap: '1rem', rowGap: '0.5rem', marginBottom: '1.25rem' }}>
          <FormField label="First Name" required id="firstName">
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => updateFormField('firstName', e.target.value)}
              disabled={formLoading}
              required
            />
          </FormField>

          <FormField label="Last Name" required id="lastName">
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => updateFormField('lastName', e.target.value)}
              disabled={formLoading}
              required
            />
          </FormField>
        </div>

        <div style={{ marginTop: '0.5rem', marginBottom: '0.75rem' }}>
          <SectionHeader title="Employment Information" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', columnGap: '1rem', rowGap: '0.5rem', marginBottom: '1.25rem' }}>
          <FormField label="Employee Number" required id="employeeNumber">
            <Input
              id="employeeNumber"
              value={employeeNumberValue}
              onChange={(e) => updateFormField('employeeNumber', e.target.value)}
              disabled={employeeNumberDisabled || formLoading}
              required
            />
          </FormField>

          <FormField label="Department" required id="departmentId">
            <Select
              id="departmentId"
              value={formData.departmentId}
              onChange={(e) => updateFormField('departmentId', e.target.value)}
              disabled={formLoading}
              required
            >
              <option value="">-- Select Department --</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </Select>
          </FormField>

          <FormField label="Job Title" required id="jobTitle">
            <Input
              id="jobTitle"
              value={formData.jobTitle}
              onChange={(e) => updateFormField('jobTitle', e.target.value)}
              disabled={formLoading}
              required
            />
          </FormField>

          <FormField label="Employment Type" required id="employmentType">
            <Select
              id="employmentType"
              value={formData.employmentType}
              onChange={(e) => updateFormField('employmentType', e.target.value)}
              disabled={formLoading}
              required
            >
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="CONTRACT">Contract</option>
              <option value="INTERN">Intern</option>
            </Select>
          </FormField>

          <FormField label="Hire Date" id="hireDate">
            <Input
              id="hireDate"
              type="date"
              value={formData.hireDate}
              onChange={(e) => updateFormField('hireDate', e.target.value)}
              disabled={formLoading}
            />
          </FormField>
          
          {hasGlobalAccess && (
            <FormField label="User Account" id="userId">
              <Select
                id="userId"
                value={formData.userId}
                onChange={(e) => updateFormField('userId', e.target.value)}
                disabled={formLoading}
              >
                <option value="">-- No User Account --</option>
                {usersToDisplay.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.firstName} {u.lastName} ({u.email})
                  </option>
                ))}
              </Select>
            </FormField>
          )}
        </div>

        <div style={{ marginTop: '0.5rem', marginBottom: '0.75rem' }}>
          <SectionHeader title="Contact Information" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', columnGap: '1rem', rowGap: '0.5rem', marginBottom: '1.25rem' }}>
          <FormField label="Work Email" id="workEmail">
            <Input
              id="workEmail"
              type="email"
              value={formData.workEmail}
              onChange={(e) => updateFormField('workEmail', e.target.value)}
              disabled={formLoading}
            />
          </FormField>

          <FormField label="Contact Number" id="contactNumber">
            <Input
              id="contactNumber"
              value={formData.contactNumber}
              onChange={(e) => updateFormField('contactNumber', e.target.value)}
              disabled={formLoading}
            />
          </FormField>

          <FormField label="Personal Email" id="personalEmail">
            <Input
              id="personalEmail"
              type="email"
              value={formData.personalEmail}
              onChange={(e) => updateFormField('personalEmail', e.target.value)}
              disabled={formLoading}
            />
          </FormField>
        </div>

        <div style={{ marginTop: '0.5rem', marginBottom: '0.75rem' }}>
          <SectionHeader title="Capacity and Notes" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', columnGap: '1rem', rowGap: '0.5rem', marginBottom: '1.25rem' }}>
          <FormField label="Weekly Capacity (Hours)" id="weeklyCapacityHours">
            <Input
              id="weeklyCapacityHours"
              type="number"
              min="0"
              max="168"
              step="0.5"
              value={formData.weeklyCapacityHours}
              onChange={(e) => updateFormField('weeklyCapacityHours', Number(e.target.value))}
              disabled={formLoading}
            />
          </FormField>

          <FormField label="Notes" id="notes">
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) => updateFormField('notes', e.target.value)}
              disabled={formLoading}
            />
          </FormField>
        </div>
      </div>
    </>
  );
};

const emptyFormData = {
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
  weeklyCapacityHours: 40,
  userId: '',
  notes: ''
};

export const EmployeesPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [availableUsers, setAvailableUsers] = useState<SimpleUser[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  
  const [formData, setFormData] = useState(emptyFormData);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFormLoading, setAddFormLoading] = useState(false);
  const [addFormError, setAddFormError] = useState('');
  const [addFormData, setAddFormData] = useState(emptyFormData);

  const navigate = useNavigate();
  const { user } = useAuth();

  const canCreate = user?.permissions.includes('EMPLOYEE_CREATE') ?? false;
  const hasGlobalAccess = user?.roles?.some(r => 
    ['SYSTEM_ADMIN', 'TOP_MANAGEMENT', 'TECHNICAL_COORDINATOR'].includes(r)
  ) ?? false;

  const loadData = async () => {
    try {
      setLoading(true);

      // 1. Core Employee Data (Required)
      const empData = await EmployeeApi.search();
      setEmployees(empData.content || []);

      // 2. Global Administrator Data (Optional)
      if (hasGlobalAccess) {
        const [deptResult, usersResult] = await Promise.allSettled([
          DepartmentApi.search(),
          apiClient.get('/users', { params: { active: true, unlinked: true, size: 100 } })
        ]);

        if (deptResult.status === 'fulfilled') {
          setDepartments(deptResult.value.content || []);
        } else {
          console.warn('Failed to load departments', deptResult.reason);
        }

        if (usersResult.status === 'fulfilled') {
          setAvailableUsers(usersResult.value.data?.content || []);
        } else {
          console.warn('Failed to load available users', usersResult.reason);
        }
      }
    } catch (error) {
      console.error('Failed to load employee data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleOpenAddModal = () => {
    setAddFormError('');
    setAddFormData(emptyFormData);
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    if (!addFormLoading) {
      setIsAddModalOpen(false);
      setAddFormError('');
    }
  };

  const updateAddFormField = (field: string, value: string | number) => {
    setAddFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAddFormLoading(true);
    setAddFormError('');

    try {
      const payload: CreateEmployeeRequest = {
        employeeNumber: addFormData.employeeNumber,
        departmentId: addFormData.departmentId,
        firstName: addFormData.firstName,
        lastName: addFormData.lastName,
        workEmail: addFormData.workEmail || undefined,
        personalEmail: addFormData.personalEmail || undefined,
        contactNumber: addFormData.contactNumber || undefined,
        jobTitle: addFormData.jobTitle,
        employmentType: addFormData.employmentType as any,
        hireDate: addFormData.hireDate || undefined,
        weeklyCapacityHours: addFormData.weeklyCapacityHours,
        userId: addFormData.userId || undefined,
      };

      await EmployeeApi.create(payload);
      setIsAddModalOpen(false);
      setAddFormData(emptyFormData);
      void loadData();
    } catch (err: any) {
      setAddFormError(err.response?.data?.message || 'Failed to create employee.');
    } finally {
      setAddFormLoading(false);
    }
  };

  const updateFormField = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleOpenModal = (employee: Employee) => {
    setFormError('');
    setSelectedEmployee(employee);
    setFormData({
      employeeNumber: employee.employeeNumber,
      firstName: employee.firstName,
      lastName: employee.lastName,
      departmentId: employee.department?.id || '',
      workEmail: employee.workEmail || '',
      jobTitle: employee.jobTitle || '',
      employmentType: employee.employmentType,
      hireDate: employee.hireDate || '',
      contactNumber: employee.contactNumber || '',
      personalEmail: employee.personalEmail || '',
      weeklyCapacityHours: employee.weeklyCapacityHours || 40,
      userId: employee.user?.id || '',
      notes: employee.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (!formLoading) {
      setIsModalOpen(false);
      setFormError('');
    }
  };

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    setFormLoading(true);
    setFormError('');

    try {
      const payload: UpdateEmployeeRequest = {
        departmentId: formData.departmentId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        workEmail: formData.workEmail || undefined,
        personalEmail: formData.personalEmail || undefined,
        contactNumber: formData.contactNumber || undefined,
        jobTitle: formData.jobTitle,
        employmentType: formData.employmentType as any,
        hireDate: formData.hireDate || undefined,
        weeklyCapacityHours: formData.weeklyCapacityHours,
        userId: formData.userId || undefined,
        notes: formData.notes || undefined,
      };

      await EmployeeApi.update(selectedEmployee.id, payload);
      setIsModalOpen(false);
      setSelectedEmployee(null);
      void loadData();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to update employee.');
    } finally {
      setFormLoading(false);
    }
  };

  const filteredEmployees = employees.filter((employee) => {
    const searchValue = search.trim().toLowerCase();

    const fullName =
      `${employee.firstName || ''} ${employee.lastName || ''}`
        .trim()
        .toLowerCase();

    const matchesSearch =
      !searchValue ||
      fullName.includes(searchValue) ||
      (employee.employeeNumber || '')
        .toLowerCase()
        .includes(searchValue) ||
      (employee.workEmail || '')
        .toLowerCase()
        .includes(searchValue);

    const matchesDepartment = deptFilter
      ? employee.department?.id === deptFilter
      : true;

    return matchesSearch && matchesDepartment;
  });

  const usersToDisplay = [...availableUsers];
  if (selectedEmployee?.user && !usersToDisplay.some(u => u.id === selectedEmployee.user!.id)) {
    usersToDisplay.unshift({
      id: selectedEmployee.user.id,
      email: selectedEmployee.user.email,
      firstName: selectedEmployee.user.firstName,
      lastName: selectedEmployee.user.lastName,
    });
  }

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <PageHeader
        title="Employees"
        description="Manage employee records, skills, qualifications, and leaves."
        icon={<ContactRound size={24} />}
        actionButton={{
          label: 'Add Employee',
          show: canCreate,
          onClick: handleOpenAddModal,
          icon: <Plus size={16} />,
        }}
      />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          width: '100%',
          marginBottom: '0.5rem',
          height: '44px',
        }}
      >
        <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
          <Input
            placeholder="Search by name, employee number, or email..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            style={{
              width: '100%',
              height: '44px',
              paddingLeft: '16px',
              paddingRight: search ? '40px' : '16px',
              borderRadius: '9px',
            }}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              style={{
                position: 'absolute',
                right: '12px',
                top: '40%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b',
                padding: '4px',
              }}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {hasGlobalAccess && (
          <div style={{ width: '220px', flexShrink: 0 }}>
            <Select
              value={deptFilter}
              onChange={(event) => setDeptFilter(event.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </Select>
          </div>
        )}
      </div>

      <Card>
        {loading ? (
          <LoadingState message="Loading employees..." />
        ) : filteredEmployees.length === 0 ? (
          <EmptyState
            title="No Employees Found"
            message="Try adjusting your search or add a new employee."
            icon={<ContactRound size={48} />}
          />
        ) : (
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
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">
                    {employee.employeeNumber}
                  </TableCell>

                  <TableCell>
                    <div className="font-medium text-gray-900">
                      {employee.firstName} {employee.lastName}
                    </div>

                    <div className="text-gray-500 text-xs">
                      {employee.workEmail}
                    </div>
                  </TableCell>

                  <TableCell>
                    {employee.department?.name || 'N/A'}
                  </TableCell>

                  <TableCell>
                    {employee.jobTitle || '—'}
                  </TableCell>

                  <TableCell>
                    <StatusBadge status={employee.employmentType} />
                  </TableCell>

                  <TableCell>
                    <StatusBadge status={employee.employmentStatus} />
                  </TableCell>

                  <TableCell align="right">
                    <IconButton
                      onClick={() => navigate(`/employees/${employee.id}`)}
                      title="View Details"
                      aria-label="View Details"
                      icon={<Eye size={16} />}
                    />

                    {user?.permissions.includes('EMPLOYEE_UPDATE') && (
                      <IconButton
                        onClick={() => handleOpenModal(employee)}
                        title="Edit Employee"
                        aria-label="Edit Employee"
                        icon={<Edit2 size={16} />}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Edit Employee Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Edit Employee"
        maxWidth="760px"
      >
        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          {formError && (
            <Alert variant="error" style={{ marginBottom: '1rem' }}>
              {formError}
            </Alert>
          )}

          <EmployeeFormFields 
            formData={formData} 
            updateFormField={updateFormField} 
            formLoading={formLoading} 
            departments={departments} 
            usersToDisplay={usersToDisplay} 
            employeeNumberDisabled={true} 
            employeeNumberValue={selectedEmployee?.employeeNumber || ''} 
            hasGlobalAccess={hasGlobalAccess}
          />

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: '1rem',
              borderTop: '1px solid #e2e8f0',
              paddingTop: '1rem',
              marginTop: '0.5rem',
              flexShrink: 0
            }}
          >
            <Button
              type="button"
              variant="ghost"
              onClick={handleCloseModal}
              disabled={formLoading}
              style={{
                minWidth: '110px',
                height: '42px',
                backgroundColor: '#f1f5f9',
                color: '#475569',
                border: '1px solid #cbd5e1',
                borderRadius: '9px',
                fontWeight: 600,
              }}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              isLoading={formLoading}
              style={{
                minWidth: '130px',
                height: '42px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: '1px solid #2563eb',
                borderRadius: '9px',
                fontSize: '14px',
                fontWeight: 600,
                boxShadow: '0 4px 10px rgba(37, 99, 235, 0.2)',
              }}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Employee Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        title="Add Employee"
        maxWidth="760px"
      >
        <form onSubmit={handleAddFormSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          {addFormError && (
            <Alert variant="error" style={{ marginBottom: '1rem' }}>
              {addFormError}
            </Alert>
          )}

          <EmployeeFormFields 
            formData={addFormData} 
            updateFormField={updateAddFormField} 
            formLoading={addFormLoading} 
            departments={departments} 
            usersToDisplay={usersToDisplay} 
            employeeNumberDisabled={false} 
            employeeNumberValue={addFormData.employeeNumber} 
            hasGlobalAccess={hasGlobalAccess}
          />

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: '1rem',
              borderTop: '1px solid #e2e8f0',
              paddingTop: '1rem',
              marginTop: '0.5rem',
              flexShrink: 0
            }}
          >
            <Button
              type="button"
              variant="ghost"
              onClick={handleCloseAddModal}
              disabled={addFormLoading}
              style={{
                minWidth: '110px',
                height: '42px',
                backgroundColor: '#f1f5f9',
                color: '#475569',
                border: '1px solid #cbd5e1',
                borderRadius: '9px',
                fontWeight: 600,
              }}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              isLoading={addFormLoading}
              style={{
                minWidth: '130px',
                height: '42px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: '1px solid #2563eb',
                borderRadius: '9px',
                fontSize: '14px',
                fontWeight: 600,
                boxShadow: '0 4px 10px rgba(37, 99, 235, 0.2)',
              }}
            >
              Create Employee
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
