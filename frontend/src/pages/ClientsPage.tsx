import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { ClientApi } from '../services/ClientApi';
import type { Client } from '../types/client';
import { Handshake, Search, Plus, Edit, Eye, ShieldAlert, ShieldCheck, RefreshCw } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PermissionGuard } from '../components/PermissionGuard';
import { Button } from '../components/Button';
import { IconButton } from '../components/IconButton';
import { Card } from '../components/Card';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../components/Table';
import { Input, Select } from '../components/Forms';
import { ErrorState, EmptyState, LoadingState } from '../components/FeedbackStates';
import { StatusBadge } from '../components/StatusBadge';
import { FilterBar } from '../components/FilterBar';

export const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const navigate = useNavigate();
  const { user } = useAuth();
  const canCreate = user?.permissions.includes('CLIENT_CREATE');

  const loadClients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const activeParam = activeFilter === 'all' ? undefined : activeFilter === 'active';
      const data = await ClientApi.searchClients(searchTerm || undefined, activeParam, page, 50); // Get more since we local filter
      setClients(data.content || []);
      setTotalPages(data.page.totalPages);
    } catch (err) {
      console.error('Failed to load clients', err);
      setError('Failed to load clients. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, activeFilter, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadClients();
    }, 400); // Debounce
    return () => clearTimeout(timer);
  }, [loadClients]);

  const handleActivateDeactivate = async (client: Client) => {
    try {
      if (client.active) {
        if (!window.confirm('Are you sure you want to deactivate this client?')) return;
        await ClientApi.deactivateClient(client.id);
      } else {
        await ClientApi.activateClient(client.id);
      }
      void loadClients();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error?.response?.data?.message || 'Failed to update client status');
    }
  };

  const filteredClients = useMemo(() => {
    if (typeFilter === 'all') return clients;
    return clients.filter(c => c.clientType === typeFilter);
  }, [clients, typeFilter]);

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <PageHeader 
        title="Clients"
        description="Manage clients and their contacts."
        icon={<Handshake size={24} />}
        actionButton={{
          label: 'Add Client',
          show: canCreate,
          onClick: () => navigate('/clients/new'),
          icon: <Plus size={16} />
        }}
      />

      <FilterBar>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <Input 
            placeholder="Search clients..." 
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setPage(0); }}
          />
        </div>
        
        <div style={{ width: '200px' }}>
          <Select 
            value={typeFilter} 
            onChange={e => { setTypeFilter(e.target.value); setPage(0); }}
          >
            <option value="all">All Types</option>
            <option value="INDIVIDUAL">Individual</option>
            <option value="COMPANY">Company</option>
          </Select>
        </div>

        <div style={{ width: '200px' }}>
          <Select 
            value={activeFilter} 
            onChange={e => { setActiveFilter(e.target.value); setPage(0); }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        </div>
        
        <Button variant="ghost" onClick={loadClients} isLoading={loading}>
          <RefreshCw size={16} style={{ marginRight: '8px' }} /> Refresh
        </Button>
      </FilterBar>

      <Card>
        {error ? (
          <ErrorState message={error} onRetry={loadClients} />
        ) : loading && clients.length === 0 ? (
          <LoadingState message="Loading clients..." />
        ) : filteredClients.length === 0 ? (
          <EmptyState 
            icon={<Search size={48} />}
            title="No clients found" 
            message="Try adjusting your filters or search terms." 
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader>Name</TableHeader>
                    <TableHeader>Type</TableHeader>
                    <TableHeader>Email</TableHeader>
                    <TableHeader>Phone</TableHeader>
                    <TableHeader>Status</TableHeader>
                    <TableHeader align="right">Actions</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredClients.map(client => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium text-gray-900">{client.name}</TableCell>
                      <TableCell>{client.clientType}</TableCell>
                      <TableCell>{client.email || '-'}</TableCell>
                      <TableCell>{client.phone || '-'}</TableCell>
                      <TableCell>
                        <StatusBadge 
                          status={client.active ? 'Active' : 'Inactive'} 
                          variant={client.active ? 'success' : 'neutral'} 
                        />
                      </TableCell>
                      <TableCell align="right">
                        <div className="flex justify-end gap-2">
                          <IconButton onClick={() => navigate(`/clients/${client.id}`)} title="View Details" aria-label="View Details">
                            <Eye size={16} />
                          </IconButton>
                          <PermissionGuard permission="CLIENT_UPDATE">
                            <IconButton onClick={() => navigate(`/clients/${client.id}/edit`)} title="Edit Client" aria-label="Edit Client">
                              <Edit size={16} />
                            </IconButton>
                          </PermissionGuard>
                          
                          {client.active ? (
                            <PermissionGuard permission="CLIENT_DELETE">
                              <IconButton onClick={() => handleActivateDeactivate(client)} title="Deactivate" aria-label="Deactivate" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                <ShieldAlert size={16} />
                              </IconButton>
                            </PermissionGuard>
                          ) : (
                            <PermissionGuard permission="CLIENT_UPDATE">
                              <IconButton onClick={() => handleActivateDeactivate(client)} title="Activate" aria-label="Activate" className="text-green-600 hover:text-green-700 hover:bg-green-50">
                                <ShieldCheck size={16} />
                              </IconButton>
                            </PermissionGuard>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center mt-6 space-x-4 border-t border-gray-200 pt-4">
                <Button 
                  variant="outline" 
                  disabled={page === 0 || loading} 
                  onClick={() => setPage(p => p - 1)}
                >
                  Previous
                </Button>
                <span className="flex items-center text-gray-700 text-sm font-medium">
                  Page {page + 1} of {totalPages}
                </span>
                <Button 
                  variant="outline" 
                  disabled={page >= totalPages - 1 || loading} 
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};
