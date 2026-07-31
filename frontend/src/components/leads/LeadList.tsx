import React, { useState, useEffect, useCallback } from 'react';
import { LeadApi } from '../../services/LeadApi';
import { ClientApi } from '../../services/ClientApi';
import type { Lead } from '../../types/lead';
import type { Client } from '../../types/client';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Edit, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Button } from '../Button';
import { IconButton } from '../IconButton';
import { PermissionGuard } from '../PermissionGuard';
import { Card } from '../Card';
import { Input, Select } from '../Forms';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../Table';
import { StatusBadge } from '../StatusBadge';
import { ErrorState, EmptyState, LoadingState } from '../FeedbackStates';

export const LeadList: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('active');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [clients, setClients] = useState<Client[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

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
  }, [searchTerm, statusFilter, activeFilter, clientFilter, page]);

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
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <Input 
              type="text" 
              placeholder="Search leads..." 
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setPage(0); }}
              label="Search"
            />
          </div>
          
          <div className="w-full md:w-48">
            <Select 
              value={clientFilter} 
              onChange={e => { setClientFilter(e.target.value); setPage(0); }}
              label="Client"
            >
              <option value="all">All Clients</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </div>
          
          <div className="w-full md:w-48">
            <Select 
              value={statusFilter} 
              onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
              label="Status"
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
          
          <div className="w-full md:w-48">
            <Select 
              value={activeFilter} 
              onChange={e => { setActiveFilter(e.target.value); setPage(0); }}
              label="Active State"
            >
              <option value="all">All Active State</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </Select>
          </div>
        </div>
      </Card>

      {error ? (
        <ErrorState message={error} onRetry={loadLeads} />
      ) : loading && leads.length === 0 ? (
        <LoadingState message="Loading leads..." />
      ) : leads.length === 0 ? (
        <EmptyState 
          icon={<Search size={48} />}
          title="No leads found" 
          message="Try adjusting your filters or search terms." 
        />
      ) : (
        <>
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
                  <TableCell className="font-medium">{lead.title}</TableCell>
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
                      <PermissionGuard permission="LEAD_UPDATE">
                        <IconButton onClick={() => navigate(`/leads/${lead.id}/edit`)} title="Edit Lead" aria-label="Edit Lead">
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
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex justify-center mt-6 space-x-4">
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
    </div>
  );
};
