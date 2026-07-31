import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/Api';
import type { User } from '../context/AuthContext';
import { Search, RefreshCw, Users } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../components/Table';
import { Input } from '../components/Forms';
import { Button } from '../components/Button';
import { StatusBadge } from '../components/StatusBadge';
import { ErrorState, LoadingState, EmptyState } from '../components/FeedbackStates';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination & Filters
  const [page, setPage] = useState(0);
  const size = 20; // Hardcode size for now since we don't have a UI for it
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0); // Reset page on new search
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

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <PageHeader 
        title={<><Users size={24} className="inline-icon text-blue-600" /> User Management</>}
        description="Manage system users, roles, and access."
        actionButton={{
          label: 'Refresh Data',
          show: true,
          onClick: handleRefresh,
          icon: <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        }}
      />

      {error && (
        <div className="mb-6">
          <ErrorState message={error} onRetry={handleRefresh} />
        </div>
      )}

      <Card>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-lg font-semibold text-gray-900">All Users</h2>
          <div className="w-full md:w-64">
            <Input 
              type="text" 
              placeholder="Search users..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        {loading ? (
          <LoadingState message="Loading user database..." />
        ) : users.length === 0 ? (
          <EmptyState 
            icon={<Search size={48} />}
            title="No users found" 
            message="No users match your search." 
          />
        ) : (
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
                  <TableCell className="font-medium text-gray-900">{u.firstName} {u.lastName}</TableCell>
                  <TableCell className="text-gray-500">{u.email}</TableCell>
                  <TableCell>
                    <div className="flex gap-2 flex-wrap">
                      {u.roles.map(role => (
                        <StatusBadge 
                          key={role} 
                          status={role.replace('_', ' ')} 
                          variant={role === 'SYSTEM_ADMIN' ? 'info' : 'neutral'} 
                        />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status="Active" variant="success" />
                  </TableCell>
                  <TableCell align="right">
                    <Button variant="ghost">Edit</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
};
