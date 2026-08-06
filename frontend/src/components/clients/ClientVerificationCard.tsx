import React, { useState } from 'react';
import { format } from 'date-fns';
import { CheckCircle2, Clock, XCircle, RefreshCw, Link2, Copy, AlertTriangle, Shield } from 'lucide-react';
import { Button } from '../Button';
import { StatusBadge } from '../StatusBadge';
import type { ClientVerificationDTO } from '../../services/ApprovalApi';
import {
  createClientVerification,
  getVerificationLink,
  regenerateClientVerification,
} from '../../services/ApprovalApi';

interface ClientVerificationCardProps {
  verifications: ClientVerificationDTO[];
  projectBriefId: string | undefined;
  opportunityId: string;
  canCreate: boolean;
  onRefresh: () => void;
}

interface LinkModalState {
  isOpen: boolean;
  url: string;
  isNew: boolean;
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

const statusIcon = (status: string) => {
  switch (status) {
    case 'CONFIRMED': return <CheckCircle2 size={18} className="text-success" />;
    case 'PENDING': return <Clock size={18} className="text-warning" />;
    case 'CHANGES_REQUESTED': return <AlertTriangle size={18} className="text-info" />;
    case 'REJECTED':
    case 'REVOKED': return <XCircle size={18} className="text-danger" />;
    case 'EXPIRED': return <AlertTriangle size={18} className="text-danger" />;
    default: return <Shield size={18} className="text-text-muted" />;
  }
};

const fmtDate = (d: string | undefined | null) => {
  if (!d) return 'N/A';
  try { return format(new Date(d), 'MMM d, yyyy h:mm a'); }
  catch { return d; }
};

export const ClientVerificationCard: React.FC<ClientVerificationCardProps> = ({
  verifications,
  projectBriefId,
  opportunityId,
  canCreate,
  onRefresh,
}) => {
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [linkModal, setLinkModal] = useState<LinkModalState>({ isOpen: false, url: '', isNew: false });
  const [copySuccess, setCopySuccess] = useState(false);

  // The latest verification record (if any)
  const latest = verifications.length > 0 ? verifications[0] : null;
  const status: string = latest?.status ?? 'NOT_GENERATED';

  const buildUrl = (token: string) => `${window.location.origin}/client-verification/${token}`;

  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    } catch {
      // clipboard may be blocked in http
      setCopySuccess(false);
    }
  };

  const handleGenerate = async () => {
    if (!projectBriefId) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await createClientVerification(projectBriefId, { opportunityId });
      setLinkModal({ isOpen: true, url: buildUrl(res.token), isNew: true });
      onRefresh();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setActionError(e.response?.data?.message || 'Failed to generate verification link.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRegenerate = async (id: string) => {
    if (!window.confirm('Regenerate the verification link? The current link will be permanently invalidated.')) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await regenerateClientVerification(id);
      setLinkModal({ isOpen: true, url: buildUrl(res.token), isNew: true });
      onRefresh();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string }; status?: number } };
      setActionError(e.response?.data?.message || 'Failed to regenerate link.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopyExisting = async (id: string) => {
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await getVerificationLink(id);
      const url = buildUrl(res.token);
      setLinkModal({ isOpen: true, url, isNew: false });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string }; status?: number } };
      if (e.response?.status === 409) {
        setActionError(e.response.data?.message || 'Link is no longer accessible at this stage.');
      } else {
        setActionError(e.response?.data?.message || 'Failed to fetch verification link.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const closeLinkModal = () => {
    setLinkModal({ isOpen: false, url: '', isNew: false });
    setCopySuccess(false);
  };

  return (
    <>
      <div className="border border-border rounded-lg overflow-hidden">
        {/* Card Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-surface-secondary border-b border-border">
          <div className="flex items-center gap-2">
            {statusIcon(status)}
            <h3 className="font-semibold text-text-primary">Client Verification</h3>
          </div>
          <StatusBadge
            status={status === 'NOT_GENERATED' ? 'Not Generated' : status}
            variant={statusVariant(status)}
          />
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-4">
          {actionError && (
            <div className="text-sm text-danger bg-red-50 border border-red-200 rounded px-3 py-2">
              {actionError}
            </div>
          )}

          {status === 'NOT_GENERATED' && (
            <div className="text-center py-6 text-text-muted">
              <Shield size={32} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">No verification link has been generated yet.</p>
              {canCreate && projectBriefId && (
                <Button
                  variant="primary"
                  className="mt-4"
                  icon={<Link2 size={16} />}
                  onClick={handleGenerate}
                  isLoading={actionLoading}
                >
                  Generate Verification Link
                </Button>
              )}
              {canCreate && !projectBriefId && (
                <p className="text-xs text-text-muted mt-3 italic">A project brief must exist before generating a verification link.</p>
              )}
            </div>
          )}

          {status === 'CONFIRMED' && latest && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-success font-medium">
                <CheckCircle2 size={18} />
                <span>Client has confirmed this project brief.</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-text-secondary">Generated</p>
                  <p className="font-medium text-text-primary">{fmtDate(latest.createdAt?.toString())}</p>
                </div>
                <div>
                  <p className="text-text-secondary">Verified On</p>
                  <p className="font-medium text-text-primary">{fmtDate(latest.decisionDate?.toString())}</p>
                </div>
                {latest.verifierName && (
                  <div>
                    <p className="text-text-secondary">Verified By</p>
                    <p className="font-medium text-text-primary">{latest.verifierName}</p>
                  </div>
                )}
                {latest.verifierEmail && (
                  <div>
                    <p className="text-text-secondary">Client Email</p>
                    <p className="font-medium text-text-primary">{latest.verifierEmail}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {(status === 'PENDING' || status === 'CHANGES_REQUESTED') && latest && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-text-secondary">Generated</p>
                  <p className="font-medium text-text-primary">{fmtDate(latest.createdAt?.toString())}</p>
                </div>
                <div>
                  <p className="text-text-secondary">Expires</p>
                  <p className={`font-medium ${latest.expiresAt && new Date(latest.expiresAt) < new Date() ? 'text-danger' : 'text-text-primary'}`}>
                    {fmtDate(latest.expiresAt?.toString())}
                  </p>
                </div>
                {latest.verifierName && (
                  <div>
                    <p className="text-text-secondary">Verifier Name</p>
                    <p className="font-medium text-text-primary">{latest.verifierName}</p>
                  </div>
                )}
                {latest.verifierEmail && (
                  <div>
                    <p className="text-text-secondary">Client Email</p>
                    <p className="font-medium text-text-primary">{latest.verifierEmail}</p>
                  </div>
                )}
              </div>

              {latest.recoverable === false && (
                <p className="text-xs text-amber-600 italic bg-amber-50 border border-amber-200 rounded px-3 py-2">
                  The original link token is not recoverable (only its hash was stored). Please regenerate a new link.
                </p>
              )}

              {canCreate && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {latest.recoverable !== false && (
                    <Button
                      variant="outline"
                      icon={<Copy size={15} />}
                      onClick={() => handleCopyExisting(latest.id)}
                      isLoading={actionLoading}
                    >
                      Copy Verification Link
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    icon={<RefreshCw size={15} />}
                    onClick={() => handleRegenerate(latest.id)}
                    isLoading={actionLoading}
                  >
                    Regenerate Link
                  </Button>
                </div>
              )}
            </div>
          )}

          {(status === 'EXPIRED' || status === 'REVOKED' || status === 'REJECTED') && latest && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-text-secondary">Generated</p>
                  <p className="font-medium text-text-primary">{fmtDate(latest.createdAt?.toString())}</p>
                </div>
                {latest.expiresAt && (
                  <div>
                    <p className="text-text-secondary">Expiry</p>
                    <p className="font-medium text-danger">{fmtDate(latest.expiresAt?.toString())}</p>
                  </div>
                )}
                {latest.verifierEmail && (
                  <div>
                    <p className="text-text-secondary">Client Email</p>
                    <p className="font-medium text-text-primary">{latest.verifierEmail}</p>
                  </div>
                )}
              </div>

              {canCreate && projectBriefId && (
                <Button
                  variant="primary"
                  icon={<Link2 size={16} />}
                  onClick={handleGenerate}
                  isLoading={actionLoading}
                >
                  Generate New Link
                </Button>
              )}
            </div>
          )}

          {/* Version history (if multiple) */}
          {verifications.length > 1 && (
            <details className="mt-2">
              <summary className="text-xs text-text-muted cursor-pointer hover:text-text-secondary select-none">
                Show {verifications.length - 1} older record{verifications.length > 2 ? 's' : ''}
              </summary>
              <ul className="mt-2 space-y-2">
                {verifications.slice(1).map(v => (
                  <li key={v.id} className="text-xs text-text-muted border-l-2 border-border pl-3">
                    <StatusBadge status={v.status} variant={statusVariant(v.status)} className="text-xs" />
                    <span className="ml-2">{fmtDate(v.createdAt?.toString())}</span>
                    {v.verifierEmail && <span className="ml-2">— {v.verifierEmail}</span>}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      </div>

      {/* Link display modal */}
      {linkModal.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {linkModal.isNew ? '✅ Verification Link Generated' : 'Verification Link'}
            </h2>

            {linkModal.isNew && (
              <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
                Link generated successfully! Share this with your client to confirm the project brief.
              </div>
            )}

            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg break-all text-sm font-mono text-gray-800 select-all">
              {linkModal.url}
            </div>

            <div className="flex flex-col gap-2">
              <Button
                variant="primary"
                icon={<Copy size={15} />}
                className="w-full"
                onClick={() => handleCopy(linkModal.url)}
              >
                {copySuccess ? '✓ Copied!' : 'Copy Link'}
              </Button>
              <a
                href={linkModal.url}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex justify-center items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Link2 size={15} /> Open Verification Page
              </a>
              <Button variant="outline" className="w-full" onClick={closeLinkModal}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
