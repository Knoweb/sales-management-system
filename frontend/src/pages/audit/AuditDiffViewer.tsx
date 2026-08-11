import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAuditLogById } from '../../api/auditApi';
import type { AuditLogEventDTO } from '../../api/auditApi';
import { LoadingState } from '../../components/FeedbackStates';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/Button';

export const AuditDiffViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [log, setLog] = useState<AuditLogEventDTO | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLog = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getAuditLogById(id);
      setLog(data);
    } catch (error) {
      console.error('Error fetching audit log:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLog();
  }, [fetchLog]);

  if (loading) {
    return <div className="p-8"><LoadingState message="Loading audit details..." /></div>;
  }

  if (!log) {
    return <div className="p-8 text-center">Log not found.</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-content">
          <div className="flex items-center gap-4 mb-2">
            <Link to="/audit-logs">
              <Button variant="ghost" className="p-0 text-text-muted hover:text-text-primary text-sm">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <h1 className="page-title m-0">Audit Details</h1>
          </div>
          <p className="page-subtitle">View changes for {log.entityType} ({log.entityId})</p>
        </div>
      </div>

      <div className="card mb-6">
        <div className="card-header">
          <h2 className="text-lg font-semibold m-0">Event Metadata</h2>
        </div>
        <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-text-muted mb-1">Event Type</div>
            <div className="font-medium">{log.eventType}</div>
          </div>
          <div>
            <div className="text-sm text-text-muted mb-1">Action</div>
            <div>
              <span className={`badge ${log.action === 'CREATE' ? 'badge-success' : log.action === 'DELETE' ? 'badge-danger' : 'badge-info'}`}>
                {log.action}
              </span>
            </div>
          </div>
          <div>
            <div className="text-sm text-text-muted mb-1">User</div>
            <div className="font-medium">{log.createdByName || log.createdBy}</div>
          </div>
          <div>
            <div className="text-sm text-text-muted mb-1">Timestamp</div>
            <div className="font-medium">{new Date(log.createdAt).toLocaleString()}</div>
          </div>
          {log.ipAddress && (
            <div>
              <div className="text-sm text-text-muted mb-1">IP Address</div>
              <div className="font-medium font-mono text-sm">{log.ipAddress}</div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header bg-surface-secondary">
            <h2 className="text-lg font-semibold m-0 text-danger">Previous State</h2>
          </div>
          <div className="p-0 overflow-auto max-h-[600px] bg-slate-50 dark:bg-slate-900">
            <pre className="p-4 text-sm font-mono m-0 text-slate-800 dark:text-slate-300">
              {log.previousState ? JSON.stringify(log.previousState, null, 2) : 'None'}
            </pre>
          </div>
        </div>
        <div className="card">
          <div className="card-header bg-surface-secondary">
            <h2 className="text-lg font-semibold m-0 text-success">New State</h2>
          </div>
          <div className="p-0 overflow-auto max-h-[600px] bg-slate-50 dark:bg-slate-900">
            <pre className="p-4 text-sm font-mono m-0 text-slate-800 dark:text-slate-300">
              {log.newState ? JSON.stringify(log.newState, null, 2) : 'None'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditDiffViewer;
