import React, { useEffect, useState, useCallback } from 'react';
import { ClientApi } from '../services/ClientApi';
import type { Client } from '../types/client';
import { Briefcase, Search, Plus, Filter, Edit, Eye, ShieldAlert, ShieldCheck } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PermissionGuard } from '../components/PermissionGuard';
import { Button } from '../components/Button';

export const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
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
      const data = await ClientApi.searchClients(searchTerm || undefined, activeParam, page, 10);
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
    }, 300); // Debounce
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

  return (
    <div className="page-container">
      <PageHeader 
        title={<><Briefcase size={24} className="inline-icon" /> Clients</>}
        description="Manage clients and their contacts."
        actionButton={{
          label: 'Add Client',
          show: canCreate,
          onClick: () => navigate('/clients/new'),
          icon: <Plus size={16} />
        }}
      />

      <div className="card">
        <div className="card-header flex-between">
          <h2 className="card-title">Client List</h2>
          <div className="flex gap-4">
            <div className="search-input" style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.25rem 0.5rem' }}>
              <Search size={16} style={{ color: 'var(--text-light)', marginRight: '0.5rem' }} />
              <input 
                type="text" 
                placeholder="Search clients..." 
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setPage(0); }}
                style={{ border: 'none', outline: 'none', background: 'transparent' }}
              />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={16} style={{ color: 'var(--text-light)' }} />
              <select 
                value={activeFilter} 
                onChange={e => { setActiveFilter(e.target.value); setPage(0); }}
                style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.25rem' }}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card-body">
          {error && <div className="error-message">{error}</div>}
          
          {loading && clients.length === 0 ? (
            <p>Loading clients...</p>
          ) : clients.length === 0 ? (
            <p>No clients found.</p>
          ) : (
            <>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map(client => (
                    <tr key={client.id}>
                      <td>{client.name}</td>
                      <td>{client.clientType}</td>
                      <td>{client.email || '-'}</td>
                      <td>{client.phone || '-'}</td>
                      <td>
                        <span style={{ 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '1rem', 
                          fontSize: '0.75rem',
                          backgroundColor: client.active ? 'var(--success-bg)' : 'var(--error-bg)',
                          color: client.active ? 'var(--success)' : 'var(--error)'
                        }}>
                          {client.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <Button variant="ghost" onClick={() => navigate(`/clients/${client.id}`)} title="View Details">
                            <Eye size={16} />
                          </Button>
                          <PermissionGuard permission="CLIENT_UPDATE">
                            <Button variant="ghost" onClick={() => navigate(`/clients/${client.id}/edit`)} title="Edit Client">
                              <Edit size={16} />
                            </Button>
                          </PermissionGuard>
                          
                          {client.active ? (
                            <PermissionGuard permission="CLIENT_DELETE">
                              <Button variant="ghost" onClick={() => handleActivateDeactivate(client)} title="Deactivate" style={{ color: 'var(--error)' }}>
                                <ShieldAlert size={16} />
                              </Button>
                            </PermissionGuard>
                          ) : (
                            <PermissionGuard permission="CLIENT_UPDATE">
                              <Button variant="ghost" onClick={() => handleActivateDeactivate(client)} title="Activate" style={{ color: 'var(--success)' }}>
                                <ShieldCheck size={16} />
                              </Button>
                            </PermissionGuard>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', gap: '0.5rem', alignItems: 'center' }}>
                  <Button 
                    variant="secondary" 
                    disabled={page === 0 || loading} 
                    onClick={() => setPage(p => p - 1)}
                  >
                    Previous
                  </Button>
                  <span>Page {page + 1} of {totalPages}</span>
                  <Button 
                    variant="secondary" 
                    disabled={page >= totalPages - 1 || loading} 
                    onClick={() => setPage(p => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
