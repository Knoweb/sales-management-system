import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAuditLogById } from '../../api/auditApi';
import type { AuditLogEventDTO } from '../../api/auditApi';
import { LoadingState } from '../../components/FeedbackStates';
import { ArrowLeft, ChevronDown, ChevronUp, Copy, Check, Info, Link as LinkIcon, History, Code } from 'lucide-react';
import { 
  formatEventType, 
  formatAuditFieldName, 
  formatAuditValue, 
  getChangedFields,
  formatPermission 
} from '../../utils/auditDisplayUtils';
import './AuditDiffViewer.css';

export const AuditDiffViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [log, setLog] = useState<AuditLogEventDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRaw, setShowRaw] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
    return <div style={{ padding: '32px' }}><LoadingState message="Loading audit details..." /></div>;
  }

  if (!log) {
    return <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Log not found.</div>;
  }

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(type);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const actor = log.actorNameSnapshot || 'SYSTEM';
  const eventName = formatEventType(log.eventType);
  
  const getParsedState = (stateString: any) => {
    if (!stateString) return null;
    try {
      return typeof stateString === 'string' ? JSON.parse(stateString) : stateString;
    } catch {
      return null;
    }
  };

  const prevState = getParsedState(log.previousState);
  const newState = getParsedState(log.newState);
  const changedFields = getChangedFields(log.previousState, log.newState);

  const getActionBadgeClass = (action: string) => {
    switch (action) {
      case 'CREATE': return 'badge badge-success';
      case 'DELETE': return 'badge badge-error';
      case 'UPDATE': return 'badge badge-info';
      default: return 'badge badge-neutral';
    }
  };

  const getActionCardHeaderClass = (action: string) => {
    switch (action) {
      case 'CREATE': return 'audit-state-card-header create';
      case 'DELETE': return 'audit-state-card-header delete';
      case 'UPDATE': return 'audit-state-card-header update';
      default: return 'audit-state-card-header';
    }
  };

  // Reusable Field View Component
  const FieldValue = ({ field, val }: { field: string, val: any }) => {
    if (val === null || val === undefined || val === '') {
      return <span style={{ color: 'var(--color-text-muted)' }}>—</span>;
    }

    if (field === 'permissions' && Array.isArray(val)) {
      return (
        <details style={{ marginTop: '4px' }}>
          <summary style={{ cursor: 'pointer', fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)' }}>
            <span className="badge badge-neutral" style={{ marginRight: '8px' }}>{val.length} assigned</span>
            View Permissions
          </summary>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
            {val.map((p, i) => (
              <span key={i} className="badge badge-neutral" style={{ fontWeight: 'normal' }}>
                {formatPermission(p)}
              </span>
            ))}
          </div>
        </details>
      );
    }

    // Semantic status badges
    if (typeof val === 'boolean') {
      if (field === 'active') {
        return val ? <span className="badge badge-success">Active</span> : <span className="badge badge-error">Inactive</span>;
      }
      if (field === 'passwordChangeRequired') {
        return val ? <span className="badge badge-warning">Required</span> : <span className="badge badge-success">Not Required</span>;
      }
    }

    return <span>{formatAuditValue(val, field)}</span>;
  };

  // Render object as fields
  const renderStateFields = (stateObj: any) => {
    if (!stateObj || Object.keys(stateObj).length === 0) return <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', margin: 0 }}>No fields available.</p>;
    
    // Create a copy to manipulate
    const displayObj = { ...stateObj };

    // Combine firstName and lastName into Full Name if both exist
    if ('firstName' in displayObj && 'lastName' in displayObj) {
      displayObj.fullName = `${displayObj.firstName} ${displayObj.lastName}`.trim();
      delete displayObj.firstName;
      delete displayObj.lastName;
    }

    return (
      <div className="audit-meta-grid">
        {Object.entries(displayObj).map(([key, value]) => {
          const sensitive = ['password', 'passwordHash', 'token', 'secret', 'jwt', 'temporaryPassword', 'refreshToken', 'accessToken'];
          if (sensitive.includes(key)) return null;
          
          return (
            <div key={key} className="audit-meta-row" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
              <span className="audit-meta-label">
                {key === 'fullName' ? 'Full Name' : formatAuditFieldName(key)}
              </span>
              <div className="audit-meta-value">
                <FieldValue field={key} val={value} />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderChangesTable = () => {
    if (changedFields.length === 0) {
      return <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', margin: 0 }}>Field-level before/after values were not recorded for this event.</p>;
    }
    
    return (
      <div className="table-container" style={{ boxShadow: 'none' }}>
        <table className="audit-diff-table">
          <thead>
            <tr>
              <th>Field</th>
              <th>Previous Value</th>
              <th>New Value</th>
            </tr>
          </thead>
          <tbody>
            {changedFields.map(({ field, prev, next }, idx) => (
              <tr key={idx}>
                <td style={{ fontWeight: 500 }}>
                  {formatAuditFieldName(field)}
                </td>
                <td>
                  <div className="audit-diff-prev">
                    <FieldValue field={field} val={prev} />
                  </div>
                </td>
                <td>
                  <div className="audit-diff-next">
                    <FieldValue field={field} val={next} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="audit-details-page">
      <div style={{ marginBottom: '24px' }}>
        <Link to="/audit-logs" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
          <ArrowLeft size={16} />
          Back to Audit Logs
        </Link>
      </div>

      <div className="audit-header">
        <div className="audit-header-title-row">
          <h1 className="text-page-title m-0">{eventName}</h1>
          <span className={getActionBadgeClass(log.action)}>
            {log.action}
          </span>
        </div>
        <div className="audit-header-meta">
          Performed by <strong>{actor}</strong> <br/>
          {log.occurredAt ? new Date(log.occurredAt).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—'}
        </div>
      </div>

      <div className="audit-card">
        <div className="audit-card-header">
          <div className="audit-card-header-icon"><Info size={18} /></div>
          <h2 className="audit-card-title">Event Information</h2>
        </div>
        <div className="audit-card-body">
          <div className="audit-meta-grid">
            <div className="audit-meta-row">
              <span className="audit-meta-label">Performed By</span>
              <span className="audit-meta-value">{actor}</span>
            </div>
            <div className="audit-meta-row">
              <span className="audit-meta-label">Date & Time</span>
              <span className="audit-meta-value">
                {log.occurredAt ? new Date(log.occurredAt).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—'}
              </span>
            </div>
            <div className="audit-meta-row">
              <span className="audit-meta-label">Entity Type</span>
              <span className="audit-meta-value">{log.entityType}</span>
            </div>
            <div className="audit-meta-row">
              <span className="audit-meta-label">Event Type</span>
              <span className="audit-meta-value">{eventName}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="audit-card">
        <div className="audit-card-header">
          <div className="audit-card-header-icon"><LinkIcon size={18} /></div>
          <h2 className="audit-card-title">Entity Reference</h2>
        </div>
        <div className="audit-card-body">
          <div className="audit-meta-grid">
            <div className="audit-meta-row">
              <span className="audit-meta-label">Entity ID</span>
              <div className="audit-meta-value">
                <div className="audit-id-copy">
                  {log.entityId}
                  <button onClick={() => handleCopy(log.entityId, 'entity')} aria-label="Copy Entity ID">
                    {copiedId === 'entity' ? <Check size={14} style={{ color: 'var(--color-success)' }} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>
            <div className="audit-meta-row">
              <span className="audit-meta-label">Audit Record ID</span>
              <div className="audit-meta-value">
                <div className="audit-id-copy">
                  {log.id}
                  <button onClick={() => handleCopy(log.id, 'audit')} aria-label="Copy Audit ID">
                    {copiedId === 'audit' ? <Check size={14} style={{ color: 'var(--color-success)' }} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>
            <div className="audit-meta-row">
              <span className="audit-meta-label">Event Reference</span>
              <span className="audit-meta-value" style={{ fontFamily: 'monospace', fontSize: 'var(--font-size-sm)' }}>
                {log.eventType}
              </span>
            </div>
            <div className="audit-meta-row">
              <span className="audit-meta-label">Action</span>
              <span className="audit-meta-value">
                <span className={getActionBadgeClass(log.action)}>{log.action}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <History size={20} style={{ color: 'var(--color-text-primary)' }} />
        <h2 className="text-section-title m-0">Changes & State</h2>
      </div>

      {log.action === 'CREATE' && (
        <div className="audit-card">
          <div className={getActionCardHeaderClass(log.action)}>
            <h3>NEW RECORD</h3>
            <span className={getActionBadgeClass(log.action)}>CREATE</span>
          </div>
          <div className="audit-state-desc">
            This record was created. No previous state exists.
          </div>
          <div className="audit-card-body">
            {renderStateFields(newState)}
          </div>
        </div>
      )}

      {log.action === 'UPDATE' && (
        <div className="audit-card">
          <div className={getActionCardHeaderClass(log.action)}>
            <h3>Changes Made</h3>
            <span className={getActionBadgeClass(log.action)}>UPDATE</span>
          </div>
          <div className="audit-state-desc">
            Only changed fields are shown below.
          </div>
          <div style={{ padding: 0 }}>
            {renderChangesTable()}
          </div>
        </div>
      )}

      {log.action === 'DELETE' && (
        <div className="audit-card">
          <div className={getActionCardHeaderClass(log.action)}>
            <h3>DELETED RECORD</h3>
            <span className={getActionBadgeClass(log.action)}>DELETE</span>
          </div>
          <div className="audit-state-desc">
            This record was deleted.
          </div>
          <div style={{ padding: '16px 24px', backgroundColor: 'var(--color-surface-secondary)', borderBottom: '1px solid var(--color-border)' }}>
            <h4 style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}>Record Before Deletion</h4>
          </div>
          <div className="audit-card-body">
            {renderStateFields(prevState)}
          </div>
        </div>
      )}

      <div className="audit-card" style={{ marginBottom: '0' }}>
        <button className="audit-tech-toggle" onClick={() => setShowRaw(!showRaw)}>
          <div className="audit-tech-toggle-left">
            <div className="audit-tech-icon"><Code size={20} /></div>
            <div>
              <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, color: 'var(--color-text-primary)' }}>Technical Details</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>Raw audit data for troubleshooting</div>
            </div>
          </div>
          <div style={{ color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--font-size-sm)' }}>
            {showRaw ? 'Hide Technical Details' : 'Show Technical Details'}
            {showRaw ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </button>
        
        {showRaw && (
          <div className="audit-tech-body">
            <div>
              <div className="audit-tech-panel-header">
                <div className="dot-red"></div>
                Previous State (Raw)
              </div>
              <pre className="audit-tech-panel">
                {log.previousState ? (typeof log.previousState === 'string' ? JSON.stringify(JSON.parse(log.previousState), null, 2) : JSON.stringify(log.previousState, null, 2)) : 'null'}
              </pre>
            </div>
            <div>
              <div className="audit-tech-panel-header">
                <div className="dot-green"></div>
                New State (Raw)
              </div>
              <pre className="audit-tech-panel">
                {log.newState ? (typeof log.newState === 'string' ? JSON.stringify(JSON.parse(log.newState), null, 2) : JSON.stringify(log.newState, null, 2)) : 'null'}
              </pre>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default AuditDiffViewer;
