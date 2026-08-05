import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import {
  Building2,
  Eye,
  Plus,
  Search,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { DepartmentApi } from '../services/DepartmentApi';
import type {
  CreateDepartmentRequest,
  Department,
} from '../types/department';

import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/Table';
import { StatusBadge } from '../components/StatusBadge';
import { IconButton } from '../components/IconButton';
import {
  FormField,
  Input,
  Textarea,
} from '../components/Forms';
import {
  EmptyState,
  LoadingState,
} from '../components/FeedbackStates';
import { Modal } from '../components/Modal';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';

const emptyDepartmentForm: CreateDepartmentRequest = {
  code: '',
  name: '',
  description: '',
};

export const DepartmentsPage = () => {
  const [departments, setDepartments] = useState<
    Department[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] =
    useState(false);

  const [formData, setFormData] =
    useState<CreateDepartmentRequest>(
      emptyDepartmentForm
    );

  const [formLoading, setFormLoading] =
    useState(false);

  const [formError, setFormError] = useState<
    string | null
  >(null);

  const navigate = useNavigate();
  const { user } = useAuth();

  const loadDepartments = async () => {
    try {
      setLoading(true);

      const data = await DepartmentApi.search();

      setDepartments(data.content || []);
    } catch (error) {
      console.error(
        'Failed to load departments',
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDepartments();
  }, []);

  const handleOpenAddModal = () => {
    setFormData({
      ...emptyDepartmentForm,
    });

    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    if (!formLoading) {
      setIsAddModalOpen(false);
      setFormError(null);

      setFormData({
        ...emptyDepartmentForm,
      });
    }
  };

  const handleFormChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCreateDepartment = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setFormLoading(true);
    setFormError(null);

    try {
      await DepartmentApi.create({
        code: formData.code.trim(),
        name: formData.name.trim(),
        description:
          formData.description?.trim() || '',
      });

      setIsAddModalOpen(false);

      setFormData({
        ...emptyDepartmentForm,
      });

      await loadDepartments();
    } catch (error: unknown) {
      const apiError = error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      setFormError(
        apiError.response?.data?.message ||
          'Failed to create department.'
      );
    } finally {
      setFormLoading(false);
    }
  };

  const filteredDepartments = departments.filter(
    (department) => {
      const searchValue = search
        .trim()
        .toLowerCase();

      return (
        department.name
          .toLowerCase()
          .includes(searchValue) ||
        department.code
          .toLowerCase()
          .includes(searchValue)
      );
    }
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Departments"
        description="Manage company organizational structure."
        icon={<Building2 size={24} />}
        actionButton={{
          label: 'Add Department',
          show: Boolean(
            user?.permissions?.includes(
              'DEPARTMENT_CREATE'
            )
          ),
          onClick: handleOpenAddModal,
          icon: <Plus size={16} />,
        }}
      />

      <div className="mb-5">
        <Input
          type="search"
          placeholder="Search by department name or code..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          style={{
            width: '100%',
            height: '44px',
            paddingLeft: '16px',
            paddingRight: '16px',
            borderRadius: '9px',
          }}
        />
      </div>

      <Card>
        {loading ? (
          <div className="flex min-h-[320px] items-center justify-center">
            <LoadingState message="Loading departments..." />
          </div>
        ) : filteredDepartments.length === 0 ? (
          <div className="flex min-h-[320px] items-center justify-center">
            <EmptyState
              icon={<Search size={44} />}
              title="No departments found"
              message={
                search
                  ? 'No departments match your search criteria.'
                  : 'No departments are available in the system.'
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Code</TableHeader>

                  <TableHeader>Name</TableHeader>

                  <TableHeader>Status</TableHeader>

                  <TableHeader>
                    Employees
                  </TableHeader>

                  <TableHeader>
                    Active HOD
                  </TableHeader>

                  <TableHeader align="right">
                    Actions
                  </TableHeader>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredDepartments.map(
                  (department) => (
                    <TableRow key={department.id}>
                      <TableCell>
                        <span className="font-medium text-gray-900">
                          {department.code}
                        </span>
                      </TableCell>

                      <TableCell>
                        <span className="text-gray-900">
                          {department.name}
                        </span>
                      </TableCell>

                      <TableCell>
                        <StatusBadge
                          status={
                            department.active
                              ? 'Active'
                              : 'Inactive'
                          }
                        />
                      </TableCell>

                      <TableCell>
                        {department.employeeCount}
                      </TableCell>

                      <TableCell>
                        {department.activeHod ? (
                          <span className="text-gray-900">
                            {
                              department.activeHod
                                .firstName
                            }{' '}
                            {
                              department.activeHod
                                .lastName
                            }
                          </span>
                        ) : (
                          <span className="text-gray-500">
                            Not Assigned
                          </span>
                        )}
                      </TableCell>

                      <TableCell align="right">
                        <div className="flex justify-end">
                          <IconButton
                            type="button"
                            icon={<Eye size={16} />}
                            onClick={() =>
                              navigate(
                                `/departments/${department.id}`
                              )
                            }
                            title="View Details"
                            aria-label={`View ${department.name} details`}
                            variant="ghost"
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <Modal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        title="Add New Department"
        maxWidth="600px"
      >
        <form onSubmit={handleCreateDepartment}>
          {formError && (
            <div style={{ marginBottom: '20px' }}>
              <Alert variant="error">
                {formError}
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
            Enter the department details to add a new
            department to the system.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
              marginBottom: '20px',
            }}
          >
            <FormField
              label="Department Code"
              required
              id="code"
              helpText="Example: IT, HR, SALES"
            >
              <Input
                id="code"
                type="text"
                name="code"
                value={formData.code}
                onChange={handleFormChange}
                disabled={formLoading}
                placeholder="Enter department code"
                autoComplete="off"
                required
                style={{
                  width: '100%',
                  height: '44px',
                }}
              />
            </FormField>

            <FormField
              label="Department Name"
              required
              id="name"
            >
              <Input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                disabled={formLoading}
                placeholder="Enter department name"
                autoComplete="off"
                required
                style={{
                  width: '100%',
                  height: '44px',
                }}
              />
            </FormField>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <FormField
              label="Description"
              id="description"
            >
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                disabled={formLoading}
                placeholder="Enter a description of the department..."
                style={{
                  width: '100%',
                  minHeight: '110px',
                  resize: 'vertical',
                }}
              />
            </FormField>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: '1rem',
              paddingTop: '20px',
              borderTop: '1px solid #e2e8f0',
            }}
          >
            <Button
              type="button"
              variant="ghost"
              onClick={handleCloseAddModal}
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
                minWidth: '155px',
                height: '42px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: '1px solid #2563eb',
                borderRadius: '9px',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              Create Department
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};