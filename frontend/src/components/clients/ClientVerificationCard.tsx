import React, { useState } from 'react';
import { format } from 'date-fns';
import { CheckCircle2, Download, Check, FileText } from 'lucide-react';
import { Button } from '../Button';
import { StatusBadge } from '../StatusBadge';
import { Card } from '../Card';
import { EmptyState } from '../FeedbackStates';
import type { ClientVerificationDTO } from '../../services/ApprovalApi';
import {
  downloadClientApprovalDocument,
  markClientConfirmed,
} from '../../services/ApprovalApi';

interface ClientVerificationCardProps {
  verifications: ClientVerificationDTO[];
  opportunityId: string;
  canCreate: boolean;
  onRefresh: () => void;
  isBdmApprovedForCurrentVersion: boolean;
}

const statusVariant = (status: string): 'success' | 'warning' | 'error' | 'neutral' | 'info' => {
  switch (status) {
    case 'CONFIRMED': return 'success';
    case 'PENDING': return 'warning';
    case 'CHANGES_REQUESTED': return 'info';
    case 'REJECTED':
    case 'REVOKED':
    case 'EXPIRED': return 'error';
    default: return 'neutral';
  }
};

const fmtDate = (d: string | undefined | null) => {
  if (!d) return 'N/A';
  try { return format(new Date(d), 'MMM d, yyyy h:mm a'); }
  catch { return d; }
};

export const ClientVerificationCard: React.FC<ClientVerificationCardProps> = ({
  verifications,
  opportunityId,
  canCreate,
  onRefresh,
  isBdmApprovedForCurrentVersion,
}) => {
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // The latest verification record (if any)
  const latest = verifications.length > 0 ? verifications[0] : null;
  const status: string = latest?.status ?? 'NOT_GENERATED';

  const handleDownloadPdf = async () => {
    setActionLoading(true);
    setActionError(null);
    try {
      const blob = await downloadClientApprovalDocument(opportunityId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `OPP-${opportunityId.substring(0, 8)}-client-approval.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err: unknown) {
      const e = err as { response?: { data?: Blob } };

      if (e.response?.data instanceof Blob) {
        // Blob error reading
        try {
          const text = await e.response.data.text();
          const json = JSON.parse(text);
          setActionError(json.message || 'Failed to download document.');
        } catch {
          setActionError('Failed to download document.');
        }
      } else {
        setActionError('Failed to download document.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewPdf = async () => {
    setActionLoading(true);
    setActionError(null);
    try {
      const blob = await downloadClientApprovalDocument(opportunityId);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      window.open(url, '_blank');
      setTimeout(() => window.URL.revokeObjectURL(url), 5000);
    } catch (err: unknown) {
      const e = err as { response?: { data?: Blob } };
      if (e.response?.data instanceof Blob) {
        try {
          const text = await e.response.data.text();
          const json = JSON.parse(text);
          setActionError(json.message || 'Failed to view document.');
        } catch {
          setActionError('Failed to view document.');
        }
      } else {
        setActionError('Failed to view document.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkConfirmed = async () => {
    setActionLoading(true);
    setActionError(null);
    try {
      await markClientConfirmed(opportunityId);
      onRefresh();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setActionError(e.response?.data?.message || 'Failed to confirm client verification.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <Card>
        <div className="flex-between border-b border-border pb-4" style={{ marginBottom: '20px' }}>
          <h3 className="text-lg font-semibold text-text-primary">Client Verification</h3>
          <StatusBadge
            status={status === 'NOT_GENERATED' && !isBdmApprovedForCurrentVersion ? 'Pending BDM Approval' :
              status === 'NOT_GENERATED' ? 'Pending Client Approval' :
                status === 'CONFIRMED' ? 'Approved' :
                  status}
            variant={statusVariant(status === 'NOT_GENERATED' ? 'neutral' : status)}
          />
        </div>

        <div className="space-y-4">
          {actionError && (
            <div className="text-sm text-danger bg-red-50 border border-red-200 rounded px-3 py-2">
              {actionError}
            </div>
          )}

          {!isBdmApprovedForCurrentVersion && status !== 'CONFIRMED' && (
            <EmptyState
              title="BDM Approval Required"
              message="The project brief must be approved by a BDM before generating the client approval document."
            />
          )}

          {isBdmApprovedForCurrentVersion && status !== 'CONFIRMED' && (
            <div className="space-y-4">
              <div style={{ backgroundColor: 'var(--color-surface-secondary)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '16px' }}>
                <p style={{ margin: '0 0 16px', color: 'var(--color-text-muted)', fontSize: '14px', lineHeight: 1.5 }}>
                  Download the approved project document and send it to the client. After receiving the client's approval externally, record it here.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    icon={<FileText size={16} />}
                    onClick={handleViewPdf}
                    isLoading={actionLoading}
                    className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300"
                  >
                    View Client Approval Document
                  </Button>

                  <Button
                    variant="outline"
                    icon={<Download size={16} />}
                    onClick={handleDownloadPdf}
                    isLoading={actionLoading}
                  >
                    Download Document
                  </Button>

                  {canCreate && (
                    <Button
                      variant="primary"
                      icon={<Check size={16} />}
                      onClick={handleMarkConfirmed}
                      disabled={actionLoading}
                      isLoading={actionLoading}
                      className="!bg-green-600 hover:!bg-green-700 !text-white !border-transparent"
                    >
                      {actionLoading ? 'Confirming...' : 'Confirm Client Approval'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {status === 'CONFIRMED' && latest && (
            <div className="space-y-4">
              <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CheckCircle2 size={22} color="#16A34A" />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 600, fontSize: '15px', color: '#166534' }}>Client Approval Confirmed</span>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>The client has approved this Project Brief.</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div style={{ padding: '16px', backgroundColor: 'var(--color-surface-secondary)', border: '1px solid var(--color-border)', borderRadius: '10px' }}>
                  <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Approved On</p>
                  <p style={{ margin: '7px 0 0', color: 'var(--color-text-primary)', fontSize: '15px', fontWeight: 500 }}>{fmtDate(latest.decisionDate?.toString())}</p>
                </div>
                {latest.recordedByName && (
                  <div style={{ padding: '16px', backgroundColor: 'var(--color-surface-secondary)', border: '1px solid var(--color-border)', borderRadius: '10px' }}>
                    <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Recorded By</p>
                    <p style={{ margin: '7px 0 0', color: 'var(--color-text-primary)', fontSize: '15px', fontWeight: 500 }}>{latest.recordedByName}</p>
                  </div>
                )}
                {latest.projectBriefVersionNumber && (
                  <div style={{ padding: '16px', backgroundColor: 'var(--color-surface-secondary)', border: '1px solid var(--color-border)', borderRadius: '10px' }}>
                    <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Brief Version</p>
                    <p style={{ margin: '7px 0 0', color: 'var(--color-text-primary)', fontSize: '15px', fontWeight: 500 }}>Version {latest.projectBriefVersionNumber}</p>
                  </div>
                )}
              </div>

              {isBdmApprovedForCurrentVersion && (
                <div className="pt-2 flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    icon={<FileText size={16} />}
                    onClick={handleViewPdf}
                    isLoading={actionLoading}
                    className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300"
                  >
                    View Client Approval Document
                  </Button>
                  <Button
                    variant="outline"
                    icon={<Download size={16} />}
                    onClick={handleDownloadPdf}
                    isLoading={actionLoading}
                  >
                    Download Document
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Legacy statuses, handle gracefully */}
          {(status === 'PENDING' || status === 'CHANGES_REQUESTED' || status === 'EXPIRED' || status === 'REVOKED' || status === 'REJECTED') && latest && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 italic">This opportunity has legacy client verification records.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div style={{ padding: '16px', backgroundColor: 'var(--color-surface-secondary)', border: '1px solid var(--color-border)', borderRadius: '10px' }}>
                  <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Generated</p>
                  <p style={{ margin: '7px 0 0', color: 'var(--color-text-primary)', fontSize: '15px', fontWeight: 500 }}>{fmtDate(latest.createdAt?.toString())}</p>
                </div>
              </div>
            </div>
          )}

          {verifications.length > 1 && (
            <details className="mt-2" style={{ paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
              <summary className="text-sm font-medium text-text-muted cursor-pointer hover:text-text-secondary select-none">
                Show {verifications.length - 1} older record{verifications.length > 2 ? 's' : ''}
              </summary>
              <ul className="mt-3 space-y-3">
                {verifications.slice(1).map(v => (
                  <li key={v.id} className="text-sm text-text-muted border-l-2 border-border pl-3 flex items-center">
                    <StatusBadge status={v.status === 'CONFIRMED' ? 'Approved' : v.status} variant={statusVariant(v.status)} />
                    <span className="ml-3 font-medium">Version {v.projectBriefVersionNumber}</span>
                    <span className="ml-3 font-medium">{fmtDate(v.createdAt?.toString())}</span>
                    {v.recordedByName && <span className="ml-2">— by {v.recordedByName}</span>}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      </Card>
    </>
  );
};

