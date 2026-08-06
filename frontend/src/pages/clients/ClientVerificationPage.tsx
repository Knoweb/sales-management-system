import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getVerificationByToken, confirmVerification, requestChangesVerification, rejectVerification, getProjectBriefVersion, type ClientVerificationDTO, type ProjectBriefVersionDTO } from '../../services/ApprovalApi';

export const ClientVerificationPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [verification, setVerification] = useState<ClientVerificationDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [briefVersion, setBriefVersion] = useState<ProjectBriefVersionDTO | null>(null);

  const [verifierName, setVerifierName] = useState('');
  const [verifierEmail, setVerifierEmail] = useState('');
  const [comments, setComments] = useState('');
  const [digitalConfirmation, setDigitalConfirmation] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchVerification = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getVerificationByToken(token!);
      setVerification(data);
      if (!data.projectBriefSnapshot && data.projectBriefId && data.projectBriefVersionNumber) {
        try {
          const versionData = await getProjectBriefVersion(data.projectBriefId, data.projectBriefVersionNumber);
          setBriefVersion(versionData);
        } catch {
          // Public unauthenticated page: ignore auth error if fallback fails
        }
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Invalid or expired link');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchVerification();
    }
  }, [token, fetchVerification]);

  const handleAction = async (action: 'confirm' | 'changes' | 'reject') => {
    if (!verifierName) {
      setError('Name is required');
      return;
    }
    if (!digitalConfirmation) {
      setError('You must check the digital confirmation box');
      return;
    }
    if ((action === 'changes' || action === 'reject') && !comments.trim()) {
      setError('Comments are required for this action');
      return;
    }

    try {
      setActionLoading(true);
      setError(null);
      const payload = { verifierName, verifierEmail, comments, digitalConfirmation };
      if (action === 'confirm') await confirmVerification(token!, payload);
      else if (action === 'changes') await requestChangesVerification(token!, payload);
      else if (action === 'reject') await rejectVerification(token!, payload);
      
      setSuccessMsg('Thank you. Your response has been recorded.');
      setVerification(prev => prev ? { ...prev, status: action === 'confirm' ? 'CONFIRMED' : action === 'changes' ? 'CHANGES_REQUESTED' : 'REJECTED' } : null);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading verification details...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">Project Brief Verification</h1>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
        {successMsg && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{successMsg}</div>}

        {!verification ? (
          <div className="text-center text-red-600">Verification details not found.</div>
        ) : verification.status !== 'PENDING' ? (
          <div className="text-center text-gray-600">
            <p className="mb-4">This verification link is no longer active.</p>
            <p className="font-semibold text-lg mb-2">Status: {verification.status}</p>
            <div className="text-sm text-gray-500 space-y-1">
              <p>Generated: {new Date(verification.createdAt).toLocaleString()}</p>
              {verification.expiresAt && <p>Expires: {new Date(verification.expiresAt).toLocaleString()}</p>}
              {verification.decisionDate && <p>Decision Date: {new Date(verification.decisionDate).toLocaleString()}</p>}
            </div>
            {(verification.projectBriefSnapshot || (briefVersion && briefVersion.snapshot)) && (
              <div className="border border-gray-200 rounded-md p-6 bg-white shadow-sm mt-6 mb-8 overflow-y-auto max-h-96 text-left">
                <h3 className="text-lg font-semibold border-b pb-2 mb-4">Project Brief Preview</h3>
                <div 
                  className="prose prose-sm max-w-none prose-headings:font-bold prose-a:text-primary"
                  dangerouslySetInnerHTML={{ __html: verification.projectBriefSnapshot || briefVersion?.snapshot || '' }} 
                />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-700 flex justify-between items-center flex-wrap gap-4">
              <div className="max-w-xl">
                <p>Please review the project brief details communicated by our team. If you agree with the scope, budget, and requirements, please fill out the form below to confirm.</p>
              </div>
              <div className="text-right text-xs text-gray-500 shrink-0">
                <p>Status: <span className="font-semibold">{verification.status}</span></p>
                <p>Generated: {new Date(verification.createdAt).toLocaleString()}</p>
                {verification.expiresAt && <p>Expires: {new Date(verification.expiresAt).toLocaleString()}</p>}
              </div>
            </div>
            
            {(verification.projectBriefSnapshot || (briefVersion && briefVersion.snapshot)) && (
              <div className="border border-gray-200 rounded-md p-6 bg-white shadow-sm mt-6 mb-8 overflow-y-auto max-h-96">
                <h3 className="text-lg font-semibold border-b pb-2 mb-4">Project Brief Preview</h3>
                <div 
                  className="prose prose-sm max-w-none prose-headings:font-bold prose-a:text-primary"
                  dangerouslySetInnerHTML={{ __html: verification.projectBriefSnapshot || briefVersion?.snapshot || '' }} 
                />
              </div>
            )}
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Your Full Name *</label>
                <input type="text" value={verifierName} onChange={e => setVerifierName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Your Email</label>
                <input type="email" value={verifierEmail} onChange={e => setVerifierEmail(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Comments / Requested Changes</label>
                <textarea value={comments} onChange={e => setComments(e.target.value)} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
              </div>
              <div className="flex items-start mt-4">
                <div className="flex h-5 items-center">
                  <input type="checkbox" checked={digitalConfirmation} onChange={e => setDigitalConfirmation(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                </div>
                <div className="ml-3 text-sm">
                  <label className="font-medium text-gray-700">Digital Confirmation *</label>
                  <p className="text-gray-500">I confirm that I am authorized to verify this project brief on behalf of the client.</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-8 pt-4 border-t">
              <button disabled={actionLoading} onClick={() => handleAction('reject')} className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50">Reject</button>
              <button disabled={actionLoading} onClick={() => handleAction('changes')} className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 disabled:opacity-50">Request Changes</button>
              <button disabled={actionLoading} onClick={() => handleAction('confirm')} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 font-medium">Confirm Brief</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
