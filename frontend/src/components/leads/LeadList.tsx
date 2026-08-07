import React, { useState, useEffect, useCallback } from 'react';
import { LeadApi } from '../../services/LeadApi';
import { ClientApi } from '../../services/ClientApi';
import type { Lead } from '../../types/lead';
import type { Client } from '../../types/client';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, ShieldAlert, ShieldCheck, X } from 'lucide-react';
import { Button } from '../Button';
import { IconButton } from '../IconButton';
import { PermissionGuard } from '../PermissionGuard';
import { Input, Select } from '../Forms';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../Table';
import { StatusBadge } from '../StatusBadge';
import { ErrorState, EmptyState, LoadingState } from '../FeedbackStates';
import { LeadForm } from './LeadForm';
import { Card } from '../Card';

interface LeadListProps {
  clientId?: string;
  hideFilters?: boolean;
  viewOnly?: boolean;
  refreshTrigger?: number;
}

export const LeadList: React.FC<LeadListProps> = ({ clientId, hideFilters, viewOnly, refreshTrigger = 0 }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editLeadId, setEditLeadId] = useState<string | undefined>();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('active');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>(clientId || 'all');
  const [clients, setClients] = useState<Client[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    if (clientId) {
      setClientFilter(clientId);
    }
  }, [clientId]);

  const navigate = useNavigate();

  const loadLeads = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const activeParam = activeFilter === 'all' ? undefined : activeFilter === 'active';
      const clientParam = clientFilter === 'all' ? undefined : clientFilter;
      const data = await LeadApi.searchLeads(searchTerm || undefined, statusFilter, activeParam, clientParam, page, 10);
      setLeads(data.content || []);
      setTotalPages(data.page.totalPages);
    } catch (err) {
      console.error('Failed to load leads', err);
      setError('Failed to load leads. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, activeFilter, clientFilter, page, refreshTrigger]);

  useEffect(() => {
    ClientApi.searchClients(undefined, undefined, 0, 100)
      .then(res => setClients(res.content || []))
      .catch(console.error);
  }, []);

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
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error?.response?.data?.message || 'Failed to update lead status');
    }
  };

  return (
    <div>
      {!hideFilters && (
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
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setPage(0); }}
              style={{
                width: '100%',
                height: '44px',
                paddingLeft: '16px',
                paddingRight: searchTerm ? '40px' : '16px',
                borderRadius: '9px',
              }}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setPage(0);
                }}
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

          {!clientId && (
            <div style={{ width: '210px', flexShrink: 0 }}>
              <Select
                value={clientFilter}
                onChange={e => { setClientFilter(e.target.value); setPage(0); }}
              >
                <option value="all">All Clients</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </div>
          )}

          <div style={{ width: '210px', flexShrink: 0 }}>
            <Select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
            >
              <option value="all">All Status</option>
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="PROPOSAL_SENT">Proposal Sent</option>
              <option value="CLOSED_WON">Closed Won</option>
              <option value="CLOSED_LOST">Closed Lost</option>
            </Select>
          </div>

          <div style={{ width: '210px', flexShrink: 0 }}>
            <Select
              value={activeFilter}
              onChange={e => { setActiveFilter(e.target.value); setPage(0); }}
            >
              <option value="all">All Active State</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </Select>
          </div>
        </div>
      )}

      <Card>
        {error ? (
          <ErrorState message={error} onRetry={loadLeads} />
        ) : loading && leads.length === 0 ? (
          <LoadingState message="Loading leads..." />
        ) : leads.length === 0 ? (
          <EmptyState
            title={clientId && hideFilters ? "No leads added" : "No leads found"}
            message={
              searchTerm !== "" || activeFilter !== "all" || statusFilter !== "all" || (clientFilter !== "all" && clientFilter !== clientId)
                ? "No leads match your current search or filters."
                : clientId && hideFilters
                  ? "This client has no leads."
                  : "No leads are available."
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Title</TableHeader>
                <TableHeader>Client</TableHeader>
                <TableHeader>Source</TableHeader>
                <TableHeader>Assigned To</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader align="right">Actions</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {leads.map(lead => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium text-gray-900">{lead.title}</TableCell>
                  <TableCell>{lead.clientName}</TableCell>
                  <TableCell>{lead.inquirySource.replace('_', ' ')}</TableCell>
                  <TableCell>{lead.assignedToName || 'Unassigned'}</TableCell>
                  <TableCell>
                    <StatusBadge status={lead.status} />
                  </TableCell>
                  <TableCell align="right">
                    <div className="flex justify-end gap-2">
                      <IconButton onClick={() => navigate(`/leads/${lead.id}`)} title="View Details" aria-label="View Details">
                        <Eye size={16} />
                      </IconButton>
                      {!viewOnly && (
                        <>
                          <PermissionGuard permission="LEAD_UPDATE">
                            <IconButton onClick={() => setEditLeadId(lead.id)} title="Edit Lead" aria-label="Edit Lead">
                              <Edit size={16} />
                            </IconButton>
                          </PermissionGuard>

                          {lead.active ? (
                            <PermissionGuard permission="LEAD_UPDATE">
                              <IconButton onClick={() => handleToggleActive(lead)} title="Deactivate" aria-label="Deactivate" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                <ShieldAlert size={16} />
                              </IconButton>
                            </PermissionGuard>
                          ) : (
                            <PermissionGuard permission="LEAD_UPDATE">
                              <IconButton onClick={() => handleToggleActive(lead)} title="Reactivate" aria-label="Reactivate" className="text-green-600 hover:text-green-700 hover:bg-green-50">
                                <ShieldCheck size={16} />
                              </IconButton>
                            </PermissionGuard>
                          )}
                        </>
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

      {editLeadId && (
        <LeadForm
          isOpen={!!editLeadId}
          leadId={editLeadId}
          onClose={() => setEditLeadId(undefined)}
          onSuccess={() => {
            setEditLeadId(undefined);
            void loadLeads();
          }}
        />
      )}
    </div>
  );
};
