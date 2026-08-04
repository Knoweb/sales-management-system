import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/Api';
import type { User } from '../context/AuthContext';
import { Search, RefreshCw, Users, Plus, Edit2 } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../components/Table';
import { FormField, Input, Select } from '../components/Forms';
import { Button } from '../components/Button';
import { IconButton } from '../components/IconButton';
import { StatusBadge } from '../components/StatusBadge';
import { ErrorState, LoadingState, EmptyState } from '../components/FeedbackStates';
import { FilterBar } from '../components/FilterBar';
import { Modal } from '../components/Modal';
import { Alert } from '../components/Alert';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination & Filters
  const [page, setPage] = useState(0);
  const size = 20; 
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'ENGINEER',
    password: ''
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchUsers = async (currentPage: number, currentSize: number, currentSearch: string) => {
    setError('');
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('size', currentSize.toString());
      if (currentSearch) {
        params.append('search', currentSearch);
      }
      
      const response = await apiClient.get(`/users?${params.toString()}`);
      if (response.data && Array.isArray(response.data.content)) {
        setUsers(response.data.content);
      } else if (Array.isArray(response.data)) {
        setUsers(response.data);
      }
    } catch {
      setError('Failed to load users. Please check your connection or permissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers(page, size, debouncedSearch);
  }, [page, size, debouncedSearch]);

  const handleRefresh = () => {
    fetchUsers(page, size, debouncedSearch);
  };

  const handleOpenModal = (user?: User) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.roles[0] || 'ENGINEER',
        password: '' // Don't populate password on edit
      });
    } else {
      setSelectedUser(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        role: 'ENGINEER',
        password: ''
      });
    }
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    
    try {
      if (selectedUser) {
        await apiClient.patch(`/users/${selectedUser.id}`, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email
        });
        
        // Update roles separately if changed
        const currentRole = selectedUser.roles[0] || 'ENGINEER';
        if (currentRole !== formData.role) {
          await apiClient.put(`/users/${selectedUser.id}/roles`, {
            roleCodes: [formData.role]
          });
        }
      } else {
        await apiClient.post('/users', {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          temporaryPassword: formData.password,
          roleCodes: [formData.role],
          active: true
        });
      }
      setIsModalOpen(false);
      handleRefresh();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setFormError(e.response?.data?.message || 'Failed to save user.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <PageHeader 
        title="User Management"
        description="Manage system users, roles, and access."
        icon={<Users size={24} />}
        actionButton={{
          label: 'Add User',
          show: true,
          onClick: () => handleOpenModal(),
          icon: <Plus size={16} />
        }}
      />

      {error && (
        <div className="mb-6">
          <ErrorState message={error} onRetry={handleRefresh} />
        </div>
      )}

      <FilterBar>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <Input 
            placeholder="Search users..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ width: '200px' }}>
          <Select disabled value="ACTIVE">
            <option value="ACTIVE">Active Users</option>
            <option value="INACTIVE">Inactive Users</option>
          </Select>
        </div>
        <Button variant="ghost" onClick={handleRefresh} isLoading={loading}>
          <RefreshCw size={16} style={{ marginRight: '8px' }} /> Refresh
        </Button>
      </FilterBar>

      <Card>
        {loading ? (
          <LoadingState message="Loading user database..." />
        ) : users.length === 0 ? (
          <EmptyState 
            icon={<Search size={48} />}
            title="No users found" 
            message="No users match your search criteria." 
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Name</TableHeader>
                  <TableHeader>Email Address</TableHeader>
                  <TableHeader>System Roles</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader align="right">Actions</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="font-medium text-gray-900">{u.firstName} {u.lastName}</div>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-500">{u.email}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 flex-wrap">
                        {u.roles.map(role => (
                          <StatusBadge 
                            key={role} 
                            status={role} 
                          />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status="ACTIVE" />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton 
                        icon={<Edit2 size={16} />} 
                        onClick={() => handleOpenModal(u)}
                        title="Edit User"
                        aria-label="Edit User"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => !formLoading && setIsModalOpen(false)}
        title={selectedUser ? 'Edit User' : 'Add New User'}
        maxWidth="600px"
      >
        <form onSubmit={handleFormSubmit}>
          {formError && (
            <Alert variant="error" style={{ marginBottom: '1.5rem' }}>
              {formError}
            </Alert>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <FormField label="First Name" required id="firstName">
              <Input 
                id="firstName"
                value={formData.firstName}
                onChange={e => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                disabled={formLoading}
                required
              />
            </FormField>
            <FormField label="Last Name" required id="lastName">
              <Input 
                id="lastName"
                value={formData.lastName}
                onChange={e => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                disabled={formLoading}
                required
              />
            </FormField>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <FormField label="Email Address" required id="email">
              <Input 
                id="email"
                type="email"
                value={formData.email}
                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                disabled={formLoading || !!selectedUser} // Cannot change email if editing
                required
              />
            </FormField>
          </div>

          {!selectedUser && (
            <div style={{ marginBottom: '1.5rem' }}>
              <FormField label="Password" required id="password">
                <Input 
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  disabled={formLoading}
                  required
                />
              </FormField>
            </div>
          )}

          <div style={{ marginBottom: '2rem' }}>
            <FormField label="System Role" required id="role">
              <Select 
                id="role"
                value={formData.role}
                onChange={e => setFormData(prev => ({ ...prev, role: e.target.value }))}
                disabled={formLoading}
                required
              >
                <option value="ENGINEER">User</option>
                <option value="BDM">Business Development Manager</option>
                <option value="HOD">Head of Department</option>
                <option value="TECHNICAL_COORDINATOR">Technical Coordinator</option>
                <option value="SYSTEM_ADMIN">System Admin</option>
                <option value="SALES_OFFICER">Sales Officer</option>
                <option value="TOP_MANAGEMENT">Top Management</option>
              </Select>
            </FormField>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} disabled={formLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={formLoading}>
              {selectedUser ? 'Save Changes' : 'Create User'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
