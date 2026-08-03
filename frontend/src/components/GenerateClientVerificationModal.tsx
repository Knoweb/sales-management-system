import React, { useState } from 'react';
import { Button } from './Button';
import { createClientVerification } from '../services/ApprovalApi';

interface GenerateClientVerificationModalProps {
  isOpen: boolean;
  onClose: (token?: string) => void;
  projectBriefId: string;
  opportunityId?: string;
}

export const GenerateClientVerificationModal: React.FC<GenerateClientVerificationModalProps> = ({
  isOpen,
  onClose,
  projectBriefId,
  opportunityId
}) => {
  const [verifierName, setVerifierName] = useState('');
  const [verifierEmail, setVerifierEmail] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError(null);
      const data: Record<string, string> = {};
      if (verifierName) data.verifierName = verifierName;
      if (verifierEmail) data.verifierEmail = verifierEmail;
      if (expiresAt) {
        data.expiresAt = new Date(expiresAt).toISOString();
      }
      if (opportunityId) data.opportunityId = opportunityId;

      const res = await createClientVerification(projectBriefId, data);
      const verificationUrl = `${window.location.origin}/client-verification/${res.token}`;
      setGeneratedLink(verificationUrl);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Failed to generate link.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleClose = () => {
    setVerifierName('');
    setVerifierEmail('');
    setExpiresAt('');
    const tokenToReturn = generatedLink ? generatedLink.split('/').pop() : undefined;
    setGeneratedLink(null);
    setCopySuccess(false);
    setError(null);
    onClose(tokenToReturn);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 px-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-semibold mb-4">Generate Client Verification Link</h2>
        
        {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}
        
        {!generatedLink ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Verifier Name (Optional)</label>
              <input 
                type="text" 
                value={verifierName} 
                onChange={(e) => setVerifierName(e.target.value)} 
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                placeholder="e.g. John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Verifier Email (Optional)</label>
              <input 
                type="email" 
                value={verifierEmail} 
                onChange={(e) => setVerifierEmail(e.target.value)} 
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                placeholder="e.g. john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Token Expiry (Optional, defaults to 7 days)</label>
              <input 
                type="date" 
                value={expiresAt} 
                onChange={(e) => setExpiresAt(e.target.value)} 
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={handleClose} disabled={loading}>Cancel</Button>
              <Button variant="primary" onClick={handleGenerate} isLoading={loading}>Generate Link</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded text-sm">
              Verification link generated successfully!
            </div>
            
            <div className="p-3 bg-gray-50 border border-gray-200 rounded break-all text-sm font-mono">
              {generatedLink}
            </div>
            
            <div className="flex flex-col gap-3 mt-6">
              <Button variant="primary" onClick={handleCopy} className="w-full">
                {copySuccess ? 'Copied!' : 'Copy Link'}
              </Button>
              <a 
                href={generatedLink} 
                target="_blank" 
                rel="noreferrer"
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              >
                Open Verification Page
              </a>
              <Button variant="outline" onClick={handleClose} className="w-full mt-2">
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
