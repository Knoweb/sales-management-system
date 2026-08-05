import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from 'react';
import {
  Edit2,
  Plus,
  Search,
  Users,
} from 'lucide-react';

import { apiClient } from '../services/Api';
import type { User } from '../context/AuthContext';

import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/Table';
import {
  FormField,
  Input,
  Select,
} from '../components/Forms';
import { Button } from '../components/Button';
import { IconButton } from '../components/IconButton';
import { StatusBadge } from '../components/StatusBadge';
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '../components/FeedbackStates';
import { Modal } from '../components/Modal';
import { Alert } from '../components/Alert';

const PAGE_SIZE = 20;

const roleOptions = [
  {
    value: 'ENGINEER',
    label: 'User',
  },
  {
    value: 'BDM',
    label: 'Business Development Manager',
  },
  {
    value: 'HOD',
    label: 'Head of Department',
  },
  {
    value: 'TECHNICAL_COORDINATOR',
    label: 'Technical Coordinator',
  },
  {
    value: 'SYSTEM_ADMIN',
    label: 'System Admin',
  },
  {
    value: 'SALES_OFFICER',
    label: 'Sales Officer',
  },
  {
    value: 'TOP_MANAGEMENT',
    label: 'Top Management',
  },
];

const emptyFormData = {
  firstName: '',
  lastName: '',
  email: '',
  role: 'ENGINEER',
  password: '',
};

export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] =
    useState('');

  const [isModalOpen, setIsModalOpen] =
    useState(false);
  const [selectedUser, setSelectedUser] =
    useState<User | null>(null);

  const [formLoading, setFormLoading] =
    useState(false);
  const [formError, setFormError] = useState('');

  const [formData, setFormData] =
    useState(emptyFormData);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(0);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [search]);

  const fetchUsers = useCallback(
    async (
      currentPage: number,
      currentSize: number,
      currentSearch: string
    ) => {
      setError('');
      setLoading(true);

      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          size: currentSize.toString(),
        });

        if (currentSearch) {
          params.append('search', currentSearch);
        }

        const response = await apiClient.get(
          `/users?${params.toString()}`
        );

        if (
          response.data &&
          Array.isArray(response.data.content)
        ) {
          setUsers(response.data.content);
        } else if (Array.isArray(response.data)) {
          setUsers(response.data);
        } else {
          setUsers([]);
        }
      } catch {
        setError(
          'Failed to load users. Please check your connection or permissions.'
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchUsers(
      page,
      PAGE_SIZE,
      debouncedSearch
    );
  }, [
    page,
    debouncedSearch,
    fetchUsers,
  ]);

  const handleRetry = () => {
    fetchUsers(
      page,
      PAGE_SIZE,
      debouncedSearch
    );
  };

  const updateFormField = (
    field: keyof typeof formData,
    value: string
  ) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleOpenModal = (user?: User) => {
    setFormError('');

    if (user) {
      setSelectedUser(user);

      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.roles?.[0] || 'ENGINEER',
        password: '',
      });
    } else {
      setSelectedUser(null);
      setFormData(emptyFormData);
    }

    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (!formLoading) {
      setIsModalOpen(false);
      setFormError('');
    }
  };

  const handleFormSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setFormLoading(true);
    setFormError('');

    try {
      if (selectedUser) {
        await apiClient.patch(
          `/users/${selectedUser.id}`,
          {
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            email: formData.email.trim(),
          }
        );

        const currentRole =
          selectedUser.roles?.[0] || 'ENGINEER';

        if (currentRole !== formData.role) {
          await apiClient.put(
            `/users/${selectedUser.id}/roles`,
            {
              roleCodes: [formData.role],
            }
          );
        }
      } else {
        await apiClient.post('/users', {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          temporaryPassword: formData.password,
          roleCodes: [formData.role],
          active: true,
        });
      }

      setIsModalOpen(false);
      setSelectedUser(null);
      setFormData(emptyFormData);

      await fetchUsers(
        page,
        PAGE_SIZE,
        debouncedSearch
      );
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
          'Failed to save user.'
      );
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="User Management"
        description="Manage system users, roles, and access."
        icon={<Users size={24} />}
        actionButton={{
          label: 'Add User',
          show: true,
          onClick: () => handleOpenModal(),
          icon: <Plus size={16} />,
        }}
      />

      {error && (
        <div className="mb-6">
          <ErrorState
            message={error}
            onRetry={handleRetry}
          />
        </div>
      )}

      <div>
        <Input
          type="search"
          placeholder="Search by name or email..."
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
            <LoadingState message="Loading user database..." />
          </div>
        ) : users.length === 0 ? (
          <div className="flex min-h-[320px] items-center justify-center">
            <EmptyState
              icon={<Search size={44} />}
              title="No users found"
              message={
                search
                  ? 'No users match your search criteria.'
                  : 'No users are available in the system.'
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Name</TableHeader>
                  <TableHeader>
                    Email Address
                  </TableHeader>
                  <TableHeader>
                    System Roles
                  </TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader align="right">
                    Actions
                  </TableHeader>
                </TableRow>
              </TableHead>

              <TableBody>
                {users.map((user) => {
                  const fullName =
                    `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();

                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="font-medium text-gray-900">
                          {fullName}
                        </div>
                      </TableCell>

                      <TableCell>
                        <span className="text-sm text-gray-500">
                          {user.email}
                        </span>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {user.roles?.length > 0 ? (
                            user.roles.map((role) => (
                              <StatusBadge
                                key={role}
                                status={role}
                              />
                            ))
                          ) : (
                            <span className="text-sm text-gray-400">
                              No role assigned
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <StatusBadge status="ACTIVE" />
                      </TableCell>

                      <TableCell align="right">
                        <div className="flex justify-end">
                          <IconButton
                            type="button"
                            icon={<Edit2 size={16} />}
                            onClick={() =>
                              handleOpenModal(user)
                            }
                            title="Edit User"
                            aria-label={`Edit ${fullName}`}
                            variant="ghost"
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={
          selectedUser
            ? 'Edit User'
            : 'Add New User'
        }
        maxWidth="600px"
      >
        <form onSubmit={handleFormSubmit}>
          {formError && (
            <Alert
              variant="error"
              style={{
                marginBottom: '1.5rem',
              }}
            >
              {formError}
            </Alert>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
            }}
          >
            <FormField
              label="First Name"
              required
              id="firstName"
            >
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(event) =>
                  updateFormField(
                    'firstName',
                    event.target.value
                  )
                }
                disabled={formLoading}
                required
              />
            </FormField>

            <FormField
              label="Last Name"
              required
              id="lastName"
            >
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(event) =>
                  updateFormField(
                    'lastName',
                    event.target.value
                  )
                }
                disabled={formLoading}
                required
              />
            </FormField>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <FormField
              label="Email Address"
              required
              id="email"
            >
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(event) =>
                  updateFormField(
                    'email',
                    event.target.value
                  )
                }
                disabled={
                  formLoading ||
                  Boolean(selectedUser)
                }
                required
              />
            </FormField>
          </div>

          {!selectedUser && (
            <div style={{ marginBottom: '1.5rem' }}>
              <FormField
                label="Password"
                required
                id="password"
              >
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(event) =>
                    updateFormField(
                      'password',
                      event.target.value
                    )
                  }
                  disabled={formLoading}
                  required
                />
              </FormField>
            </div>
          )}

          <div style={{ marginBottom: '2rem' }}>
            <FormField
              label="System Role"
              required
              id="role"
            >
              <Select
                id="role"
                value={formData.role}
                onChange={(event) =>
                  updateFormField(
                    'role',
                    event.target.value
                  )
                }
                disabled={formLoading}
                required
              >
                {roleOptions.map((role) => (
                  <option
                    key={role.value}
                    value={role.value}
                  >
                    {role.label}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: '1rem',
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
                boxShadow:
                  '0 4px 10px rgba(37, 99, 235, 0.2)',
              }}
            >
              {selectedUser
                ? 'Save Changes'
                : 'Create User'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};