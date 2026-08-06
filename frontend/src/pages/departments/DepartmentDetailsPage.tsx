import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';
import axios from 'axios';
import {
  useNavigate,
  useParams,
} from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
} from 'lucide-react';

import { DepartmentApi } from '../../services/DepartmentApi';
import { EmployeeApi } from '../../services/EmployeeApi';

import type { Department } from '../../types/department';
import type { Employee } from '../../types/employee';

import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/Table';
import { Button } from '../../components/Button';
import { StatusBadge } from '../../components/StatusBadge';
import {
  ErrorState,
  LoadingState,
} from '../../components/FeedbackStates';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../../components/Modal';
import {
  FormField,
  Select,
} from '../../components/Forms';
import { Alert } from '../../components/Alert';

export const DepartmentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [department, setDepartment] =
    useState<Department | null>(null);

  const [employees, setEmployees] = useState<
    Employee[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<
    string | null
  >(null);

  const [
    isAssignModalOpen,
    setIsAssignModalOpen,
  ] = useState(false);

  const [
    selectedEmployeeId,
    setSelectedEmployeeId,
  ] = useState('');

  const [assignLoading, setAssignLoading] =
    useState(false);

  const [assignError, setAssignError] = useState<
    string | null
  >(null);

  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);

  const isAdmin = Boolean(
    user?.roles?.includes('SYSTEM_ADMIN')
  );

  const loadData = useCallback(async () => {
    if (!id) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const departmentData =
        await DepartmentApi.getById(id);

      setDepartment(departmentData);

      const employeeData =
        await EmployeeApi.search(
          undefined,
          id,
          'ACTIVE'
        );

      setEmployees(employeeData.content || []);
    } catch (loadError) {
      console.error(loadError);

      setError(
        'Failed to load department details.'
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  const handleOpenAssignModal = () => {
    setSelectedEmployeeId(
      department?.activeHod?.id || ''
    );

    setAssignError(null);
    setIsAssignModalOpen(true);
  };

  const handleCloseAssignModal = () => {
    if (!assignLoading) {
      setIsAssignModalOpen(false);
      setAssignError(null);
    }
  };

  const handleAssignHead = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!id || !selectedEmployeeId) {
      return;
    }

    try {
      setAssignLoading(true);
      setAssignError(null);
      setSuccessMessage(null);

      await DepartmentApi.assignHead(id, {
        employeeId: selectedEmployeeId,
      });

      setSuccessMessage(
        'Department Head assigned successfully.'
      );

      setIsAssignModalOpen(false);

      await loadData();
    } catch (assignHeadError: unknown) {
      console.error(assignHeadError);

      if (axios.isAxiosError(assignHeadError)) {
        setAssignError(
          assignHeadError.response?.data?.message ||
            'Failed to assign Department Head.'
        );
      } else {
        setAssignError(
          'Failed to assign Department Head.'
        );
      }
    } finally {
      setAssignLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex min-h-[420px] items-center justify-center">
          <LoadingState message="Loading department details..." />
        </div>
      </div>
    );
  }

  if (error || !department) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex min-h-[420px] items-center justify-center">
          <ErrorState
            message={
              error || 'Department not found.'
            }
            onRetry={loadData}
          />
        </div>
      </div>
    );
  }

  const activeHod = department.activeHod;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div style={{ marginBottom: '20px' }}>
        <Button
          type="button"
          variant="ghost"
          onClick={() =>
            navigate('/departments')
          }
          style={{
            height: '40px',
            paddingInline: '12px',
            backgroundColor: '#f8fafc',
            color: '#475569',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            boxShadow: 'none',
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <ArrowLeft
              size={18}
              strokeWidth={2.2}
            />
            Back to Departments
          </span>
        </Button>
      </div>

      <PageHeader
        title={department.name}
        description={`Department code: ${department.code}`}
        icon={<Building2 size={24} />}
      />

      {successMessage && (
        <div style={{ marginBottom: '24px' }}>
          <Alert variant="success">
            {successMessage}
          </Alert>
        </div>
      )}

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'stretch',
          gap: '24px',
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            flex: '1 1 320px',
            minWidth: 0,
          }}
        >
          <Card>
            <div style={{ padding: '24px' }}>
              <div
                style={{
                  marginBottom: '20px',
                  paddingBottom: '16px',
                  borderBottom:
                    '1px solid #e2e8f0',
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    color: '#0f172a',
                    fontSize: '20px',
                    fontWeight: 700,
                    lineHeight: 1.3,
                  }}
                >
                  Department Details
                </h2>

                <p
                  style={{
                    margin: '6px 0 0',
                    color: '#64748b',
                    fontSize: '14px',
                    lineHeight: 1.5,
                  }}
                >
                  Basic department information
                </p>
              </div>

              <div
                style={{
                  display: 'grid',
                  gap: '14px',
                }}
              >
                <div
                  style={{
                    padding: '16px',
                    backgroundColor: '#f8fafc',
                    border:
                      '1px solid #e2e8f0',
                    borderRadius: '10px',
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      color: '#64748b',
                      fontSize: '12px',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Department Name
                  </p>

                  <p
                    style={{
                      margin: '7px 0 0',
                      color: '#0f172a',
                      fontSize: '16px',
                      fontWeight: 600,
                      lineHeight: 1.5,
                      wordBreak: 'break-word',
                    }}
                  >
                    {department.name}
                  </p>
                </div>

                <div
                  style={{
                    padding: '16px',
                    backgroundColor: '#f8fafc',
                    border:
                      '1px solid #e2e8f0',
                    borderRadius: '10px',
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      color: '#64748b',
                      fontSize: '12px',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Department Code
                  </p>

                  <p
                    style={{
                      margin: '7px 0 0',
                      color: '#0f172a',
                      fontSize: '16px',
                      fontWeight: 600,
                      lineHeight: 1.5,
                    }}
                  >
                    {department.code}
                  </p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent:
                      'space-between',
                    gap: '16px',
                    padding: '16px',
                    backgroundColor: '#f8fafc',
                    border:
                      '1px solid #e2e8f0',
                    borderRadius: '10px',
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: 0,
                        color: '#64748b',
                        fontSize: '12px',
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                        textTransform:
                          'uppercase',
                      }}
                    >
                      Current Status
                    </p>

                    <p
                      style={{
                        margin: '6px 0 0',
                        color: '#475569',
                        fontSize: '14px',
                      }}
                    >
                      Department availability
                    </p>
                  </div>

                  <StatusBadge
                    status={
                      department.active
                        ? 'Active'
                        : 'Inactive'
                    }
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div
          style={{
            flex: '2 1 520px',
            minWidth: 0,
          }}
        >
          <Card>
            <div style={{ padding: '24px' }}>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent:
                    'space-between',
                  gap: '16px',
                  marginBottom: '20px',
                  paddingBottom: '16px',
                  borderBottom:
                    '1px solid #e2e8f0',
                }}
              >
                <div>
                  <h2
                    style={{
                      margin: 0,
                      color: '#0f172a',
                      fontSize: '20px',
                      fontWeight: 700,
                      lineHeight: 1.3,
                    }}
                  >
                    Active Department Head
                  </h2>

                  <p
                    style={{
                      margin: '6px 0 0',
                      color: '#64748b',
                      fontSize: '14px',
                      lineHeight: 1.5,
                    }}
                  >
                    Currently assigned Head of
                    Department
                  </p>
                </div>

                {isAdmin &&
                  department.active && (
                    <Button
                      type="button"
                      variant="primary"
                      onClick={
                        handleOpenAssignModal
                      }
                      style={{
                        minWidth: '125px',
                        height: '42px',
                        paddingInline: '18px',
                        backgroundColor:
                          '#2563eb',
                        color: '#ffffff',
                        border:
                          '1px solid #2563eb',
                        borderRadius: '9px',
                        fontSize: '14px',
                        fontWeight: 600,
                      }}
                    >
                      Assign HOD
                    </Button>
                  )}
              </div>

              {activeHod ? (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '14px',
                  }}
                >
                  <div
                    style={{
                      padding: '18px',
                      backgroundColor: '#f8fafc',
                      border:
                        '1px solid #e2e8f0',
                      borderRadius: '10px',
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        color: '#64748b',
                        fontSize: '12px',
                        fontWeight: 700,
                        letterSpacing:
                          '0.04em',
                        textTransform:
                          'uppercase',
                      }}
                    >
                      HOD Name
                    </p>

                    <p
                      style={{
                        margin: '8px 0 0',
                        color: '#0f172a',
                        fontSize: '16px',
                        fontWeight: 600,
                        lineHeight: 1.5,
                      }}
                    >
                      {activeHod.firstName}{' '}
                      {activeHod.lastName}
                    </p>
                  </div>

                  <div
                    style={{
                      padding: '18px',
                      backgroundColor: '#f8fafc',
                      border:
                        '1px solid #e2e8f0',
                      borderRadius: '10px',
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        color: '#64748b',
                        fontSize: '12px',
                        fontWeight: 700,
                        letterSpacing:
                          '0.04em',
                        textTransform:
                          'uppercase',
                      }}
                    >
                      Employee Number
                    </p>

                    <p
                      style={{
                        margin: '8px 0 0',
                        color: '#0f172a',
                        fontSize: '16px',
                        fontWeight: 600,
                      }}
                    >
                      {activeHod.employeeNumber ||
                        '-'}
                    </p>
                  </div>

                  <div
                    style={{
                      padding: '18px',
                      backgroundColor: '#f8fafc',
                      border:
                        '1px solid #e2e8f0',
                      borderRadius: '10px',
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        color: '#64748b',
                        fontSize: '12px',
                        fontWeight: 700,
                        letterSpacing:
                          '0.04em',
                        textTransform:
                          'uppercase',
                      }}
                    >
                      Job Title
                    </p>

                    <p
                      style={{
                        margin: '8px 0 0',
                        color: '#0f172a',
                        fontSize: '16px',
                        fontWeight: 600,
                        lineHeight: 1.5,
                      }}
                    >
                      {activeHod.jobTitle || '-'}
                    </p>
                  </div>

                  <div
                    style={{
                      padding: '18px',
                      backgroundColor: '#f8fafc',
                      border:
                        '1px solid #e2e8f0',
                      borderRadius: '10px',
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        color: '#64748b',
                        fontSize: '12px',
                        fontWeight: 700,
                        letterSpacing:
                          '0.04em',
                        textTransform:
                          'uppercase',
                      }}
                    >
                      Work Email
                    </p>

                    <p
                      style={{
                        margin: '8px 0 0',
                        color: '#0f172a',
                        fontSize: '15px',
                        fontWeight: 600,
                        lineHeight: 1.5,
                        wordBreak: 'break-all',
                      }}
                    >
                      {activeHod.workEmail || '-'}
                    </p>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    minHeight: '220px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '32px',
                    textAlign: 'center',
                    backgroundColor: '#f8fafc',
                    border:
                      '1px dashed #cbd5e1',
                    borderRadius: '12px',
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      color: '#0f172a',
                      fontSize: '17px',
                      fontWeight: 700,
                    }}
                  >
                    No Department Head Assigned
                  </h3>

                  <p
                    style={{
                      maxWidth: '430px',
                      margin: '10px 0 0',
                      color: '#64748b',
                      fontSize: '14px',
                      lineHeight: 1.6,
                    }}
                  >
                    This department does not
                    currently have an active Head of
                    Department.
                  </p>

                  {!isAdmin && (
                    <p
                      style={{
                        margin: '6px 0 0',
                        color: '#94a3b8',
                        fontSize: '13px',
                      }}
                    >
                      Administrator access is
                      required to assign an HOD.
                    </p>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <Card>
        <div style={{ padding: '24px' }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              marginBottom: '20px',
              paddingBottom: '16px',
              borderBottom:
                '1px solid #e2e8f0',
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  color: '#0f172a',
                  fontSize: '20px',
                  fontWeight: 700,
                  lineHeight: 1.3,
                }}
              >
                Active Employees
              </h2>

              <p
                style={{
                  margin: '6px 0 0',
                  color: '#64748b',
                  fontSize: '14px',
                }}
              >
                Employees currently assigned to this
                department
              </p>
            </div>

            <div
              style={{
                padding: '7px 13px',
                backgroundColor: '#f1f5f9',
                color: '#475569',
                borderRadius: '999px',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              {employees.length}{' '}
              {employees.length === 1
                ? 'Employee'
                : 'Employees'}
            </div>
          </div>

          {employees.length === 0 ? (
            <div
              style={{
                minHeight: '190px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '30px',
                textAlign: 'center',
                backgroundColor: '#f8fafc',
                border: '1px dashed #cbd5e1',
                borderRadius: '12px',
              }}
            >
              <h3
                style={{
                  margin: 0,
                  color: '#0f172a',
                  fontSize: '17px',
                  fontWeight: 700,
                }}
              >
                No Active Employees
              </h3>

              <p
                style={{
                  margin: '9px 0 0',
                  color: '#64748b',
                  fontSize: '14px',
                }}
              >
                No active employees were found in
                this department.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader>
                      Employee No.
                    </TableHeader>

                    <TableHeader>Name</TableHeader>

                    <TableHeader>
                      Job Title
                    </TableHeader>

                    <TableHeader>Email</TableHeader>

                    <TableHeader>Role</TableHeader>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <span className="font-medium text-gray-900">
                          {employee.employeeNumber}
                        </span>
                      </TableCell>

                      <TableCell>
                        <span className="font-medium text-gray-900">
                          {employee.firstName}{' '}
                          {employee.lastName}
                        </span>
                      </TableCell>

                      <TableCell>
                        {employee.jobTitle || '-'}
                      </TableCell>

                      <TableCell>
                        <span className="break-all text-sm text-gray-600">
                          {employee.workEmail || '-'}
                        </span>
                      </TableCell>

                      <TableCell>
                        {employee.departmentHead ? (
                          <StatusBadge status="HOD" />
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              padding: '5px 12px',
                              backgroundColor:
                                '#f1f5f9',
                              color: '#475569',
                              borderRadius:
                                '999px',
                              fontSize: '12px',
                              fontWeight: 600,
                            }}
                          >
                            Staff
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </Card>

      <Modal
        isOpen={isAssignModalOpen}
        onClose={handleCloseAssignModal}
        title="Assign Department Head"
        maxWidth="500px"
      >
        <form onSubmit={handleAssignHead}>
          {assignError && (
            <div style={{ marginBottom: '20px' }}>
              <Alert variant="error">
                {assignError}
              </Alert>
            </div>
          )}

          <p
            style={{
              margin: '0 0 20px',
              color: '#64748b',
              fontSize: '14px',
              lineHeight: 1.6,
            }}
          >
            Select an active employee to assign as
            the Head of this department.
          </p>

          <FormField
            label="Select Employee"
            required
            id="employeeSelect"
          >
            <Select
              id="employeeSelect"
              value={selectedEmployeeId}
              onChange={(event) =>
                setSelectedEmployeeId(
                  event.target.value
                )
              }
              disabled={assignLoading}
              required
            >
              <option value="">
                Choose an active employee
              </option>

              {employees.map((employee) => (
                <option
                  key={employee.id}
                  value={employee.id}
                >
                  {employee.firstName}{' '}
                  {employee.lastName} (
                  {employee.employeeNumber})
                </option>
              ))}
            </Select>
          </FormField>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: '1rem',
              marginTop: '24px',
              paddingTop: '20px',
              borderTop:
                '1px solid #e2e8f0',
            }}
          >
            <Button
              type="button"
              variant="ghost"
              onClick={handleCloseAssignModal}
              disabled={assignLoading}
              style={{
                minWidth: '105px',
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
              isLoading={assignLoading}
              disabled={!selectedEmployeeId}
              style={{
                minWidth: '165px',
                height: '42px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: '1px solid #2563eb',
                borderRadius: '9px',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              Confirm Assignment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};