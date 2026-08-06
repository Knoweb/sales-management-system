import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  getBdmApprovalById, 
  bdmApprove, 
  bdmReject, 
  bdmReturnForRevision, 
  bdmRequestInfo, 
  getProjectBriefVersion, 
  getProjectBriefAttachments, 
  getWorkflowHistory,
  getClientVerifications,
  type BdmApprovalDTO, 
  type WorkflowHistoryDTO, 
  type ProjectBriefAttachmentDTO,
  type ClientVerificationDTO
} from '../services/ApprovalApi';
import { apiClient } from '../services/Api';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { ErrorState, EmptyState, LoadingState } from '../components/FeedbackStates';
import { Button } from '../components/Button';
import { IconButton } from '../components/IconButton';
import { Textarea } from '../components/Forms';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { SectionHeader } from '../components/SectionHeader';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../components/Table';
import { Download, CheckCircle, XCircle, RotateCcw, HelpCircle, ArrowLeft, Building, Clock, FileText, CheckCircle2 } from 'lucide-react';
import { Alert } from '../components/Alert';
import { GenerateClientVerificationModal } from '../components/clients/GenerateClientVerificationModal';
import { useAuth } from '../context/AuthContext';

interface BriefData {
  projectTitle: string;
  status: string;
  expectedBudget: number;
  currency: string;
  businessProblem: string;
  requiredSolution: string;
  technicalRequirements?: string;
  requiredDepartments?: { id: string; name: string }[];
}

export const BdmReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [approval, setApproval] = useState<BdmApprovalDTO | null>(null);
  const [brief, setBrief] = useState<BriefData | null>(null);
  const [submittedBrief, setSubmittedBrief] = useState<BriefData | null>(null);
  const [attachments, setAttachments] = useState<ProjectBriefAttachmentDTO[]>([]);
  const [history, setHistory] = useState<WorkflowHistoryDTO[]>([]);
  const [clientVerifications, setClientVerifications] = useState<ClientVerificationDTO[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; type: 'error' | 'forbidden' | 'not-found' | 'conflict' } | null>(null);
  const [comments, setComments] = useState('');
  const [commentError, setCommentError] = useState('');
  
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  
  const { user } = useAuth();
  const canCreateVerification = user?.permissions?.includes('CLIENT_VERIFICATION_CREATE') || false;
  
  const [confirmDialog, setConfirmDialog] = useState<{ 
    isOpen: boolean; 
    action: 'APPROVE' | 'REJECT' | 'RETURN' | 'INFO' | null;
  }>({ isOpen: false, action: null });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // 1. Get Approval details
      const approvalData = await getBdmApprovalById(id!);
      setApproval(approvalData);

      // 2. Get Current Brief (for status and required departments)
      const briefRes = await apiClient.get(`/project-briefs/${approvalData.projectBriefId}`);
      setBrief(briefRes.data);

      // 3. Get exact submitted version
      const versionRes = await getProjectBriefVersion(approvalData.projectBriefId, approvalData.projectBriefVersionNumber);
      if (versionRes && versionRes.snapshot) {
        setSubmittedBrief(JSON.parse(versionRes.snapshot));
      }

      // 4. Get Attachments
      const attRes = await getProjectBriefAttachments(approvalData.projectBriefId);
      setAttachments(attRes);

      // 5. Get workflow history
      const histRes = await getWorkflowHistory(approvalData.opportunityId);
      setHistory(histRes);
      
      // 6. Get client verifications
      const verifications = await getClientVerifications(approvalData.opportunityId);
      setClientVerifications(verifications);
      
    } catch (err: unknown) {
      const e = err as { response?: { status?: number, data?: { message?: string } } };
      if (e.response?.status === 403) {
        setError({ message: 'You do not have permission to access this approval.', type: 'forbidden' });
      } else if (e.response?.status === 404) {
        setError({ message: 'The requested BDM approval could not be found.', type: 'not-found' });
      } else {
        setError({ message: e.response?.data?.message || 'Failed to load project brief data. Please try again.', type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchData();
    }
  }, [id, fetchData]);

  const handleActionClick = (action: 'APPROVE' | 'REJECT' | 'RETURN' | 'INFO') => {
    if (action !== 'APPROVE' && !comments.trim()) {
      setCommentError('Comments are required for this decision.');
      return;
    }
    setCommentError('');
    setConfirmDialog({ isOpen: true, action });
  };

  const handleConfirmAction = async () => {
    const { action } = confirmDialog;
    if (!action || !approval) return;
    
    try {
      setActionLoading(true);
      if (action === 'APPROVE') await bdmApprove(approval.projectBriefId, comments);
      else if (action === 'REJECT') await bdmReject(approval.projectBriefId, comments);
      else if (action === 'RETURN') await bdmReturnForRevision(approval.projectBriefId, comments);
      else if (action === 'INFO') await bdmRequestInfo(approval.projectBriefId, comments);
      
      setSuccessMessage(`Successfully processed decision: ${getConfirmTitle(action).replace(' this Project Brief?', '')}`);
      setConfirmDialog({ isOpen: false, action: null });
      setComments('');
      await fetchData(); // Refresh data
      
    } catch (err: unknown) {
      const e = err as { response?: { status?: number, data?: { message?: string } } };
      if (e.response?.status === 400) {
        setCommentError(e.response.data?.message || 'Validation failed. Please check your comments.');
      } else if (e.response?.status === 409) {
        setError({ message: e.response.data?.message || 'Workflow conflict. This approval has already been processed.', type: 'conflict' });
      } else {
        setError({ message: e.response?.data?.message || 'Failed to process decision.', type: 'error' });
      }
      setConfirmDialog({ isOpen: false, action: null });
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateVerification = async () => {
    setIsVerificationModalOpen(true);
  };

  const formatActionName = (action: string) => {
    const map: Record<string, string> = {
      'SUBMIT_FOR_BDM_REVIEW': 'Submitted for BDM Review',
      'APPROVE_PROJECT_BRIEF': 'Approved Project Brief',
      'REJECT_PROJECT_BRIEF': 'Rejected Project Brief',
      'RETURN_FOR_REVISION': 'Returned for Revision',
      'REQUEST_INFORMATION': 'Requested Information'
    };
    if (map[action]) return map[action];
    return action.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  };

  const getDisplayStatus = (status: string) => {
    if (status === 'PENDING') return 'Awaiting BDM Review';
    if (status === 'RETURNED_FOR_REVISION') return 'Returned for Revision';
    if (status === 'INFORMATION_REQUESTED') return 'Information Requested';
    return status;
  };
  
  const getBadgeVariant = (status: string) => {
    if (status === 'PENDING') return 'warning';
    if (status === 'APPROVED') return 'success';
    if (status === 'REJECTED') return 'error';
    if (status === 'RETURNED_FOR_REVISION') return 'warning';
    if (status === 'INFORMATION_REQUESTED') return 'info';
    return 'neutral';
  };

  const getConfirmTitle = (action: string | null) => {
    if (action === 'APPROVE') return 'Approve this Project Brief?';
    if (action === 'REJECT') return 'Reject this Project Brief?';
    if (action === 'RETURN') return 'Return this Project Brief for revision?';
    if (action === 'INFO') return 'Request information for this Project Brief?';
    return 'Confirm action';
  };

  if (loading && !approval) return <div className="p-6 max-w-4xl mx-auto"><LoadingState message="Loading project brief details..." /></div>;
  if (error?.type === 'not-found') return <div className="p-6 max-w-4xl mx-auto"><EmptyState title="Not Found" message={error.message} action={<Button onClick={() => navigate('/bdm-approvals')}>Back to Approvals</Button>} /></div>;
  if (error?.type === 'forbidden') return <div className="p-6 max-w-4xl mx-auto"><EmptyState title="Access Denied" message={error.message} action={<Button onClick={() => navigate('/bdm-approvals')}>Back to Approvals</Button>} /></div>;
  if (error?.type === 'error' && !approval) return <div className="p-6 max-w-4xl mx-auto"><ErrorState message={error.message} onRetry={fetchData} /></div>;
  if (!approval || !brief || !submittedBrief) return <div className="p-6 max-w-4xl mx-auto"><ErrorState message="Failed to load essential data" onRetry={fetchData} /></div>;

  const isPending = approval.status === 'PENDING';
  
  const hasActiveVerification = clientVerifications.some(v => 
    v.status === 'PENDING' || v.status === 'CONFIRMED' || v.status === 'CHANGES_REQUESTED'
  );
  const showGenerateButton = approval.status === 'APPROVED' && !hasActiveVerification && canCreateVerification;

  return (
    <div className="p-6 max-w-5xl mx-auto w-full space-y-6">
      <PageHeader 
        title={
          <div className="flex flex-col">
            <span className="text-sm font-mono text-text-muted mb-1">{approval.opportunityNumber}</span>
            <span>{approval.opportunityTitle}</span>
          </div>
        }
        icon={<FileText size={24} />}
        actionElement={
          <div className="flex items-center gap-4">
            <StatusBadge status={getDisplayStatus(approval.status)} variant={getBadgeVariant(approval.status)} />
            <Button variant="outline" icon={<ArrowLeft size={16} />} onClick={() => navigate('/bdm-approvals')}>
              Back
            </Button>
          </div>
        }
      />

      {successMessage && (
        <Alert variant="success" title="Success" className="mb-6">
          {successMessage}
        </Alert>
      )}

      {error?.type === 'conflict' && (
        <Alert variant="warning" title="Workflow Conflict" className="mb-6">
          {error.message}
        </Alert>
      )}

      {error?.type === 'error' && (
        <Alert variant="error" title="Error" className="mb-6">
          {error.message}
        </Alert>
      )}

      {/* Summary Section */}
      <Card className="p-6">
        <SectionHeader title={<div className="flex items-center gap-2 text-text-primary"><Building size={20} /> <span>Summary</span></div>} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mt-4 text-body">
          <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-border">
            <span className="font-medium text-text-secondary">Client</span>
            <span className="font-semibold text-text-primary">{approval.clientName || 'Not assigned'}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-border">
            <span className="font-medium text-text-secondary">Assigned Sales Officer</span>
            <span className="font-semibold text-text-primary">{approval.assignedSalesOfficerName || 'Not assigned'}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-border">
            <span className="font-medium text-text-secondary">Status</span>
            <span className="font-semibold text-text-primary">{getDisplayStatus(approval.status)}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-border">
            <span className="font-medium text-text-secondary">Submitted Version</span>
            <span className="font-semibold text-text-primary">Version {approval.projectBriefVersionNumber}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between py-2 md:border-b-0 border-b border-border md:col-span-2">
            <span className="font-medium text-text-secondary">Submitted Date</span>
            <span className="font-semibold text-text-primary">{format(new Date(approval.createdAt), 'dd MMM yyyy, hh:mm a')}</span>
          </div>
        </div>
      </Card>

      {/* Project Brief Details */}
      <Card className="p-6">
        <SectionHeader title={<div className="flex items-center gap-2 text-text-primary"><FileText size={20} /> <span>Project Brief Details</span></div>} />
        
        <div className="mt-6 space-y-6">
          <div>
            <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">Financial Details</h4>
            <div className="bg-surface p-4 rounded-md border border-border">
              <span className="text-text-secondary font-medium mr-2">Budget:</span>
              <span className="text-lg font-bold text-text-primary">
                {submittedBrief.currency} {submittedBrief.expectedBudget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">Business Problem</h4>
            <div className="bg-surface p-4 rounded-md border border-border text-body whitespace-pre-wrap leading-relaxed">
              {submittedBrief.businessProblem || <span className="italic text-text-muted">Not provided</span>}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">Required Solution</h4>
            <div className="bg-surface p-4 rounded-md border border-border text-body whitespace-pre-wrap leading-relaxed">
              {submittedBrief.requiredSolution || <span className="italic text-text-muted">Not provided</span>}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">Technical Requirements</h4>
            <div className="bg-surface p-4 rounded-md border border-border text-body whitespace-pre-wrap leading-relaxed">
              {submittedBrief.technicalRequirements || <span className="italic text-text-muted">Not provided</span>}
            </div>
          </div>
        </div>
      </Card>

      {/* Required Departments */}
      <Card className="p-6">
        <SectionHeader title={<div className="flex items-center gap-2 text-text-primary"><Building size={20} /> <span>Required Departments</span></div>} />
        <div className="mt-4 flex flex-wrap gap-2">
          {brief.requiredDepartments && brief.requiredDepartments.length > 0 ? (
            brief.requiredDepartments.map(dept => (
              <span key={dept.id} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-soft text-primary border border-primary/20">
                {dept.name}
              </span>
            ))
          ) : (
            <span className="text-text-muted italic">No departments specified.</span>
          )}
        </div>
      </Card>

      {/* Attachments */}
      <Card className="p-6">
        <SectionHeader title={<div className="flex items-center gap-2 text-text-primary"><Download size={20} /> <span>Attachments</span></div>} />
        <div className="mt-4">
          {attachments.length === 0 ? (
            <div className="p-4 bg-surface rounded-md border border-border text-text-muted italic">
              No attachments available for this Project Brief.
            </div>
          ) : (
            <div className="overflow-x-auto border border-border rounded-lg">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader>File Name</TableHeader>
                    <TableHeader>Type</TableHeader>
                    <TableHeader>Size</TableHeader>
                    <TableHeader>Uploaded Date</TableHeader>
                    <TableHeader align="right">Actions</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attachments.map(att => (
                    <TableRow key={att.id}>
                      <TableCell><span className="font-medium text-text-primary">{att.fileName}</span></TableCell>
                      <TableCell><span className="text-text-secondary uppercase text-xs">{att.fileType.split('/').pop()}</span></TableCell>
                      <TableCell><span className="text-text-secondary">{(att.fileSize / 1024).toFixed(2)} KB</span></TableCell>
                      <TableCell><span className="text-text-secondary">{format(new Date(att.createdAt), 'dd MMM yyyy')}</span></TableCell>
                      <TableCell align="right">
                        <IconButton 
                          icon={<Download size={18} />} 
                          aria-label={`Download ${att.fileName}`} 
                          onClick={() => window.open(att.fileUrl, '_blank')}
                          variant="ghost"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </Card>

      {/* Approval History */}
      <Card className="p-6">
        <SectionHeader title={<div className="flex items-center gap-2 text-text-primary"><Clock size={20} /> <span>Approval History</span></div>} />
        <div className="mt-6 space-y-6">
          {history.length === 0 ? (
            <p className="text-sm text-text-muted italic">No approval history found.</p>
          ) : (
            history.map((item, index) => (
              <div key={item.id} className="flex gap-4 relative">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 bg-primary rounded-full mt-1.5 z-10" />
                  {index < history.length - 1 && <div className="absolute top-4 bottom-[-24px] left-[5px] w-0.5 bg-border z-0" />}
                </div>
                <div className="pb-2 flex-1">
                  <div className="font-medium text-text-primary">{item.actorName || 'System Administrator'}</div>
                  <div className="text-sm font-semibold text-text-secondary mt-1">{formatActionName(item.action)}</div>
                  <div className="text-xs text-text-muted mt-1">{format(new Date(item.createdAt), 'dd MMM yyyy, hh:mm a')}</div>
                  {item.comments && (
                    <div className="mt-3 p-3 bg-surface rounded border border-border text-text-secondary text-sm italic">
                      "{item.comments}"
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Decision Section */}
      {isPending ? (
        <Card className="p-6 border-t-4 border-t-primary">
          <SectionHeader title={<div className="flex items-center gap-2 text-text-primary"><CheckCircle2 size={20} /> <span>Decision</span></div>} />
          <div className="mt-4">
            <Textarea
              label="Decision Comments"
              placeholder="Enter review comments..."
              rows={4}
              value={comments}
              onChange={(e) => {
                setComments(e.target.value);
                if (commentError && e.target.value.trim()) setCommentError('');
              }}
              error={commentError}
              helpText="Comments are required when rejecting, returning for revision, or requesting information."
              disabled={actionLoading}
            />
            
            <div className="mt-6 flex flex-wrap gap-4 justify-end">
              <Button 
                variant="danger" 
                icon={<XCircle size={18} />} 
                onClick={() => handleActionClick('REJECT')}
                disabled={actionLoading}
                isLoading={actionLoading && confirmDialog.action === 'REJECT'}
              >
                {actionLoading && confirmDialog.action === 'REJECT' ? 'Rejecting...' : 'Reject'}
              </Button>
              <Button 
                variant="outline" 
                style={{ borderColor: 'var(--color-warning)', color: 'var(--color-warning)' }}
                icon={<RotateCcw size={18} />} 
                onClick={() => handleActionClick('RETURN')}
                disabled={actionLoading}
                isLoading={actionLoading && confirmDialog.action === 'RETURN'}
              >
                {actionLoading && confirmDialog.action === 'RETURN' ? 'Returning...' : 'Return for Revision'}
              </Button>
              <Button 
                variant="outline" 
                style={{ borderColor: 'var(--color-info)', color: 'var(--color-info)' }}
                icon={<HelpCircle size={18} />} 
                onClick={() => handleActionClick('INFO')}
                disabled={actionLoading}
                isLoading={actionLoading && confirmDialog.action === 'INFO'}
              >
                {actionLoading && confirmDialog.action === 'INFO' ? 'Requesting...' : 'Request Information'}
              </Button>
              <Button 
                variant="primary" 
                style={{ backgroundColor: 'var(--color-success)', borderColor: 'var(--color-success)' }}
                icon={<CheckCircle size={18} />} 
                onClick={() => handleActionClick('APPROVE')}
                disabled={actionLoading}
                isLoading={actionLoading && confirmDialog.action === 'APPROVE'}
              >
                {actionLoading && confirmDialog.action === 'APPROVE' ? 'Approving...' : 'Approve'}
              </Button>
            </div>
          </div>
        </Card>
      ) : approval.status === 'APPROVED' ? (
        <Card className="p-6 border-t-4 border-t-success bg-surface-alt">
          <div className="flex flex-col items-center text-center p-4">
            <CheckCircle2 size={48} className="text-success mb-4" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">This Project Brief has been approved.</h3>
            <p className="text-text-secondary mb-6">You can now proceed to the next step in the workflow.</p>
            {showGenerateButton && (
              <Button
                variant="primary"
                onClick={handleGenerateVerification}
              >
                Generate Client Verification Link
              </Button>
            )}
            {!showGenerateButton && canCreateVerification && hasActiveVerification && (
               <p className="text-sm text-text-muted mt-4">A client verification is already active or completed.</p>
            )}
          </div>
        </Card>
      ) : null}

      {showGenerateButton && (
        <GenerateClientVerificationModal
          isOpen={isVerificationModalOpen}
          onClose={() => {
            setIsVerificationModalOpen(false);
            fetchData();
          }}
          projectBriefId={approval.projectBriefId}
          opportunityId={approval.opportunityId}
        />
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={getConfirmTitle(confirmDialog.action)}
        message={comments ? `Comments: "${comments}"` : 'No comments provided.'}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmDialog({ isOpen: false, action: null })}
        variant={confirmDialog.action === 'APPROVE' ? 'success' : confirmDialog.action === 'REJECT' ? 'danger' : confirmDialog.action === 'RETURN' ? 'warning' : 'info'}
        isLoading={actionLoading}
        confirmLabel={`Yes, ${confirmDialog.action === 'INFO' ? 'Request' : (confirmDialog.action ? confirmDialog.action.charAt(0) + confirmDialog.action.slice(1).toLowerCase() : '')}`}
      />
    </div>
  );
};

export default BdmReviewPage;

