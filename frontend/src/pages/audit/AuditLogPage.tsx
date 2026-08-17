import React, { useState, useEffect, useCallback } from 'react';
import { getAuditLogs } from '../../api/auditApi';
import type { AuditLogEventDTO } from '../../api/auditApi';
import { LoadingState, EmptyState } from '../../components/FeedbackStates';
import { History, Search } from 'lucide-react';
import { Button } from '../../components/Button';
import { Link } from 'react-router-dom';

export const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEventDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [entityTypeFilter, setEntityTypeFilter] = useState('');
  const [entityIdFilter, setEntityIdFilter] = useState('');

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAuditLogs(page, 20, entityTypeFilter, entityIdFilter);
      setLogs(data.content);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  }, [page, entityTypeFilter, entityIdFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchLogs();
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Audit Logs</h1>
          <p className="page-subtitle">Track system events and data changes over time.</p>
        </div>
      </div>

      <div className="card mb-4 p-4">
        <form onSubmit={handleSearch} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Entity Type</label>
            <input 
              type="text" 
              className="form-input w-full"
              placeholder="e.g. Lead, Quotation"
              value={entityTypeFilter}
              onChange={(e) => setEntityTypeFilter(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Entity ID</label>
            <input 
              type="text" 
              className="form-input w-full"
              placeholder="UUID"
              value={entityIdFilter}
              onChange={(e) => setEntityIdFilter(e.target.value)}
            />
          </div>
          <Button type="submit" variant="primary">
            <Search size={18} className="mr-2" /> Search
          </Button>
        </form>
      </div>

      <div className="card">
        {loading ? (
          <div className="p-8"><LoadingState message="Loading audit logs..." /></div>
        ) : logs.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={<History size={48} />}
              title="No logs found"
              message="Adjust your filters or try again later."
            />
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Entity Type</th>
                  <th>Entity ID</th>
                  <th>Action</th>
                  <th>Event Type</th>
                  <th className="text-right">Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id}>
                    <td className="whitespace-nowrap">{log.occurredAt ? new Date(log.occurredAt).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—'}</td>
                    <td>{log.actorNameSnapshot || 'SYSTEM'}</td>
                    <td>{log.entityType}</td>
                    <td className="font-mono text-xs text-text-muted">{log.entityId}</td>
                    <td><span className={`badge ${log.action === 'CREATE' ? 'badge-success' : log.action === 'DELETE' ? 'badge-danger' : 'badge-info'}`}>{log.action}</span></td>
                    <td>{log.eventType}</td>
                    <td className="text-right">
                      <Link to={`/audit-logs/${log.id}`}>
                        <Button variant="ghost" className="text-sm">View Diff</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {totalPages > 1 && (
          <div className="flex justify-between items-center p-4 border-t border-border">
            <Button 
              variant="outline" 
              disabled={page === 0} 
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-text-secondary">
              Page {page + 1} of {totalPages}
            </span>
            <Button 
              variant="outline" 
              disabled={page >= totalPages - 1} 
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogPage;
