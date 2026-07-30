import React, { useState, useEffect, useCallback } from 'react';
import { LeadApi } from '../../services/LeadApi';
import type { Lead } from '../../types/lead';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Eye, Edit, ShieldAlert } from 'lucide-react';
import { Button } from '../Button';
import { PermissionGuard } from '../PermissionGuard';

export const LeadList: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('active');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const navigate = useNavigate();

  const loadLeads = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const activeParam = activeFilter === 'all' ? undefined : activeFilter === 'active';
      const data = await LeadApi.searchLeads(searchTerm || undefined, statusFilter, activeParam, page, 10);
      setLeads(data.content || []);
      setTotalPages(data.page.totalPages);
    } catch (err) {
      console.error('Failed to load leads', err);
      setError('Failed to load leads. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, activeFilter, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadLeads();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadLeads]);

  const handleToggleActive = async (lead: Lead) => {
    try {
      const action = lead.active ? 'deactivate' : 'reactivate';
      if (!window.confirm(`Are you sure you want to ${action} this lead?`)) return;
      await LeadApi.updateStatus(lead.id, undefined, undefined, !lead.active);
      void loadLeads();
      alert(`Lead successfully ${action}d!`);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error?.response?.data?.message || 'Failed to update lead status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return { bg: 'var(--primary-bg)', color: 'var(--primary)' };
      case 'CONTACTED': return { bg: 'var(--warning-bg)', color: 'var(--warning)' };
      case 'QUALIFIED': return { bg: 'var(--info-bg)', color: 'var(--info)' };
      case 'PROPOSAL_SENT': return { bg: 'var(--primary-bg)', color: 'var(--primary)' };
      case 'CLOSED_WON': return { bg: 'var(--success-bg)', color: 'var(--success)' };
      case 'CLOSED_LOST': return { bg: 'var(--error-bg)', color: 'var(--error)' };
      default: return { bg: 'var(--text-light)', color: 'white' };
    }
  };

  return (
    <div className="card">
      <div className="card-header flex-between">
        <h2 className="card-title">Lead List</h2>
        <div className="flex gap-4">
          <div className="search-input" style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.25rem 0.5rem' }}>
            <Search size={16} style={{ color: 'var(--text-light)', marginRight: '0.5rem' }} />
            <input 
              type="text" 
              placeholder="Search leads..." 
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setPage(0); }}
              style={{ border: 'none', outline: 'none', background: 'transparent' }}
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} style={{ color: 'var(--text-light)' }} />
            <select 
              value={statusFilter} 
              onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
              style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.25rem' }}
            >
              <option value="all">All Status</option>
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="PROPOSAL_SENT">Proposal Sent</option>
              <option value="CLOSED_WON">Closed Won</option>
              <option value="CLOSED_LOST">Closed Lost</option>
            </select>
            <select 
              value={activeFilter} 
              onChange={e => { setActiveFilter(e.target.value); setPage(0); }}
              style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.25rem' }}
            >
              <option value="all">All Active State</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card-body">
        {error && <div className="error-message">{error}</div>}
        
        {loading && leads.length === 0 ? (
          <p>Loading leads...</p>
        ) : leads.length === 0 ? (
          <p>No leads found.</p>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Client</th>
                  <th>Source</th>
                  <th>Assigned To</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map(lead => {
                  const statusStyle = getStatusColor(lead.status);
                  return (
                  <tr key={lead.id}>
                    <td style={{ fontWeight: '500' }}>{lead.title}</td>
                    <td>{lead.clientName}</td>
                    <td>{lead.inquirySource.replace('_', ' ')}</td>
                    <td>{lead.assignedToName || 'Unassigned'}</td>
                    <td>
                      <span style={{ 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '1rem', 
                        fontSize: '0.75rem',
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.color
                      }}>
                        {lead.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Button variant="ghost" onClick={() => navigate(`/leads/${lead.id}`)} title="View Details">
                          <Eye size={16} />
                        </Button>
                        <PermissionGuard permission="LEAD_UPDATE">
                          <Button variant="ghost" onClick={() => navigate(`/leads/${lead.id}/edit`)} title="Edit Lead">
                            <Edit size={16} />
                          </Button>
                        </PermissionGuard>
                        
                        {lead.active ? (
                          <PermissionGuard permission="LEAD_UPDATE">
                            <Button variant="ghost" onClick={() => handleToggleActive(lead)} title="Deactivate" style={{ color: 'var(--error)' }}>
                              <ShieldAlert size={16} />
                            </Button>
                          </PermissionGuard>
                        ) : (
                          <PermissionGuard permission="LEAD_UPDATE">
                            <Button variant="ghost" onClick={() => handleToggleActive(lead)} title="Reactivate" style={{ color: 'var(--success)' }}>
                              <ShieldAlert size={16} />
                            </Button>
                          </PermissionGuard>
                        )}
                      </div>
                    </td>
                  </tr>
                )})}
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
  );
};
