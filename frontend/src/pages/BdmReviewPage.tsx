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
  type BdmApprovalDTO, 
  type WorkflowHistoryDTO, 
  type ProjectBriefAttachmentDTO
} from '../services/ApprovalApi';
import { apiClient } from '../services/Api';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { ErrorState, EmptyState, LoadingState } from '../components/FeedbackStates';
import { Button } from '../components/Button';

import { Textarea } from '../components/Forms';
import { Modal } from '../components/Modal';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../components/Table';
import { Download, CheckCircle, XCircle, RotateCcw, ArrowLeft, FileText, Info } from 'lucide-react';
import { Alert } from '../components/Alert';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; type: 'error' | 'forbidden' | 'not-found' | 'conflict' } | null>(null);
  const [comments, setComments] = useState('');
  const [commentError, setCommentError] = useState('');
  
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
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

  return (
    <div className="p-6 max-w-5xl mx-auto w-full space-y-6">
      <div style={{ marginBottom: '20px' }}>
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate('/bdm-approvals')}
          style={{
            height: '40px',
            paddingInline: '12px',
            backgroundColor: '#f8fafc',
            color: '#475569',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            boxShadow: 'none',
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <ArrowLeft size={18} strokeWidth={2.2} />
            Back to BDM Approvals
          </span>
        </Button>
      </div>

      <PageHeader 
        title={approval.opportunityTitle}
        icon={<FileText size={24} />}
        description={`Opportunity Number: ${approval.opportunityNumber}`}
        actionElement={
          <StatusBadge status={getDisplayStatus(approval.status)} variant={getBadgeVariant(approval.status)} />
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
      <Card>
        <div style={{ padding: '24px' }}>
          <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
            <h2 style={{ margin: 0, color: '#0f172a', fontSize: '20px', fontWeight: 700, lineHeight: 1.3 }}>
              Summary
            </h2>
            <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '14px', lineHeight: 1.5 }}>
              Opportunity and submission details
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '14px' }}>
            <div style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
              <p style={{ margin: 0, color: '#64748b', fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Client</p>
              <p style={{ margin: '7px 0 0', color: '#0f172a', fontSize: '16px', fontWeight: 600, lineHeight: 1.5, wordBreak: 'break-word' }}>{approval.clientName || 'Not assigned'}</p>
            </div>
            <div style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
              <p style={{ margin: 0, color: '#64748b', fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Assigned Sales Officer</p>
              <p style={{ margin: '7px 0 0', color: '#0f172a', fontSize: '16px', fontWeight: 600, lineHeight: 1.5, wordBreak: 'break-word' }}>{approval.assignedSalesOfficerName || 'Not assigned'}</p>
            </div>
            <div style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
              <p style={{ margin: 0, color: '#64748b', fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Submitted Version</p>
              <p style={{ margin: '7px 0 0', color: '#0f172a', fontSize: '16px', fontWeight: 600, lineHeight: 1.5 }}>Version {approval.projectBriefVersionNumber}</p>
            </div>
            <div style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
              <p style={{ margin: 0, color: '#64748b', fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Submitted Date</p>
              <p style={{ margin: '7px 0 0', color: '#0f172a', fontSize: '16px', fontWeight: 600, lineHeight: 1.5 }}>{format(new Date(approval.createdAt), 'MMM d, yyyy • h:mm a')}</p>
            </div>
            <div style={{ gridColumn: '1 / -1', padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <p style={{ margin: '0 0 10px 0', color: '#64748b', fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Status</p>
              <StatusBadge status={getDisplayStatus(approval.status)} variant={getBadgeVariant(approval.status)} />
            </div>
          </div>
        </div>
      </Card>

      {/* Project Brief Details */}
      <Card>
        <div style={{ padding: '24px' }}>
          <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
            <h2 style={{ margin: 0, color: '#0f172a', fontSize: '20px', fontWeight: 700, lineHeight: 1.3 }}>
              Project Brief Details
            </h2>
            <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '14px', lineHeight: 1.5 }}>
              Submitted project requirements
            </p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', width: 'fit-content' }}>
              <p style={{ margin: 0, color: '#64748b', fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Expected Budget</p>
              <p style={{ margin: '7px 0 0', color: '#0f172a', fontSize: '16px', fontWeight: 600, lineHeight: 1.5 }}>
                LKR {submittedBrief.expectedBudget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            <div style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
              <p style={{ margin: 0, color: '#64748b', fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Business Problem</p>
              <div style={{ margin: '7px 0 0', color: '#0f172a', fontSize: '15px', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {submittedBrief.businessProblem || <span style={{ fontStyle: 'italic', color: '#94a3b8' }}>Not provided</span>}
              </div>
            </div>

            <div style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
              <p style={{ margin: 0, color: '#64748b', fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Required Solution</p>
              <div style={{ margin: '7px 0 0', color: '#0f172a', fontSize: '15px', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {submittedBrief.requiredSolution || <span style={{ fontStyle: 'italic', color: '#94a3b8' }}>Not provided</span>}
              </div>
            </div>

            <div style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
              <p style={{ margin: 0, color: '#64748b', fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Technical Requirements</p>
              <div style={{ margin: '7px 0 0', color: '#0f172a', fontSize: '15px', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {submittedBrief.technicalRequirements || <span style={{ fontStyle: 'italic', color: '#94a3b8' }}>Not provided</span>}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Required Departments */}
      <Card>
        <div style={{ padding: '24px' }}>
          <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
            <h2 style={{ margin: 0, color: '#0f172a', fontSize: '20px', fontWeight: 700, lineHeight: 1.3 }}>
              Required Departments
            </h2>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {brief.requiredDepartments && brief.requiredDepartments.length > 0 ? (
              brief.requiredDepartments.map(dept => (
                <span key={dept.id} style={{ backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '6px 14px', borderRadius: '9999px', fontSize: '13px', fontWeight: 500 }}>
                  {dept.name}
                </span>
              ))
            ) : (
              <span style={{ fontStyle: 'italic', color: '#94a3b8', fontSize: '14px' }}>No departments specified.</span>
            )}
          </div>
        </div>
      </Card>

      {/* Attachments */}
      <Card>
        <div style={{ padding: '24px' }}>
          <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
            <h2 style={{ margin: 0, color: '#0f172a', fontSize: '20px', fontWeight: 700, lineHeight: 1.3 }}>
              Attachments
            </h2>
          </div>
          <div>
            {attachments.length === 0 ? (
              <EmptyState
                title="No attachments added"
                message="This project brief has no attachments."
              />
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <Table>
                  <TableHead>
                    <TableRow className="bg-slate-50 border-b border-slate-200">
                      <TableHeader className="text-xs uppercase font-medium text-slate-500 py-3 px-4">File Name</TableHeader>
                      <TableHeader className="text-xs uppercase font-medium text-slate-500 py-3 px-4">Type</TableHeader>
                      <TableHeader className="text-xs uppercase font-medium text-slate-500 py-3 px-4">Size</TableHeader>
                      <TableHeader className="text-xs uppercase font-medium text-slate-500 py-3 px-4">Uploaded Date</TableHeader>
                      <TableHeader align="right" className="text-xs uppercase font-medium text-slate-500 py-3 px-4">Actions</TableHeader>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {attachments.map(att => (
                      <TableRow key={att.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors last:border-b-0">
                        <TableCell className="py-3 px-4 align-middle">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                              <FileText size={16} />
                            </div>
                            <span className="font-medium text-sm text-slate-900 whitespace-nowrap">{att.fileName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 px-4 align-middle">
                          <span className="badge badge-neutral text-[10px] uppercase font-semibold">
                            {(() => {
                              const mime = att.fileType || '';
                              if (mime.toLowerCase().includes('pdf')) return 'PDF';
                              if (mime.toLowerCase().includes('png')) return 'PNG';
                              if (mime.toLowerCase().includes('jpeg') || mime.toLowerCase().includes('jpg')) return 'JPG';
                              return mime.split('/').pop()?.toUpperCase() || '-';
                            })()}
                          </span>
                        </TableCell>
                        <TableCell className="py-3 px-4 align-middle whitespace-nowrap text-sm text-slate-600">
                          {att.fileSize ? `${(att.fileSize / 1024 / 1024).toFixed(2)} MB` : '-'}
                        </TableCell>
                        <TableCell className="py-3 px-4 align-middle text-sm text-slate-700 whitespace-nowrap">
                          {format(new Date(att.createdAt), 'dd MMM yyyy')}
                        </TableCell>
                        <TableCell align="right" className="py-3 px-4 align-middle">
                          <div className="flex justify-end gap-2 items-center">
                            <Button
                              variant="secondary"
                              onClick={() => window.open(att.fileUrl, '_blank')}
                              className="py-1 px-3 text-xs bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 h-auto"
                            >
                              <Download size={14} className="mr-1.5 inline" /> Download
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Approval History */}
      <Card>
        <div style={{ padding: '24px' }}>
          <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
            <h2 style={{ margin: 0, color: '#0f172a', fontSize: '20px', fontWeight: 700, lineHeight: 1.3 }}>
              Approval History
            </h2>
          </div>
        <div className="mt-6 space-y-6">
          {history.length === 0 ? (
            <EmptyState 
              title="No approval history available" 
              message="This project brief does not have any approval actions yet." 
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {history.map((item, index) => {
                const actionType = item.action;
                let badgeStyles = { bg: '#eff6ff', text: '#3b82f6', border: '#bfdbfe' }; // Default / REQUEST_INFO
                
                if (actionType === 'SUBMIT') {
                  badgeStyles = { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' };
                } else if (actionType === 'APPROVE') {
                  badgeStyles = { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' };
                } else if (actionType === 'RETURN') {
                  badgeStyles = { bg: '#fffbeb', text: '#d97706', border: '#fde68a' };
                } else if (actionType === 'REJECT') {
                  badgeStyles = { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' };
                } else if (actionType === 'INFO') {
                  badgeStyles = { bg: '#ecfeff', text: '#0891b2', border: '#a5f3fc' };
                }

                return (
                  <div key={item.id} style={{ display: 'flex', gap: '16px', position: 'relative' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: '12px', height: '12px', backgroundColor: '#cbd5e1', borderRadius: '50%', marginTop: '4px', zIndex: 10 }} />
                      {index < history.length - 1 && (
                        <div style={{ position: 'absolute', top: '16px', bottom: '-24px', left: '5px', width: '2px', backgroundColor: '#e2e8f0', zIndex: 0 }} />
                      )}
                    </div>
                    <div style={{ flex: 1, paddingBottom: '8px' }}>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a' }}>
                        {item.actorName || 'System Administrator'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                        <span style={{ 
                          padding: '4px 10px', 
                          backgroundColor: badgeStyles.bg, 
                          color: badgeStyles.text, 
                          border: `1px solid ${badgeStyles.border}`,
                          borderRadius: '6px', 
                          fontSize: '12px', 
                          fontWeight: 600 
                        }}>
                          {formatActionName(item.action)}
                        </span>
                        <span style={{ fontSize: '13px', color: '#64748b' }}>
                          {format(new Date(item.createdAt), 'dd MMM yyyy, hh:mm a')}
                        </span>
                      </div>
                      {item.comments && (
                        <div style={{ marginTop: '12px' }}>
                          <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '6px' }}>
                            Comment
                          </div>
                          <div style={{ 
                            padding: '10px 14px', 
                            backgroundColor: '#f8fafc', 
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            color: '#334155',
                            fontSize: '13px',
                            lineHeight: 1.5,
                            whiteSpace: 'pre-wrap'
                          }}>
                            {item.comments}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          </div>
        </div>
      </Card>

      {/* Decision Section */}
      {isPending ? (
        <Card className="border-t-4 border-t-primary">
          <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ margin: 0, color: '#0f172a', fontSize: '20px', fontWeight: 700, lineHeight: 1.3 }}>
                Review Decision
              </h2>
              <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '14px', lineHeight: 1.5 }}>
                Choose the appropriate action after reviewing the Project Brief.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <div style={{ padding: '6px', backgroundColor: '#f0fdf4', color: '#22c55e', borderRadius: '6px' }}>
                  <CheckCircle size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>Approve</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Approve the Project Brief and continue the workflow.</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <div style={{ padding: '6px', backgroundColor: '#fffbeb', color: '#f59e0b', borderRadius: '6px' }}>
                  <RotateCcw size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>Return for Revision</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Send the Project Brief back for corrections and resubmission.</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <div style={{ padding: '6px', backgroundColor: '#fef2f2', color: '#ef4444', borderRadius: '6px' }}>
                  <XCircle size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>Reject</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Reject the Project Brief and stop this opportunity.</div>
                </div>
              </div>
            </div>

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
              disabled={actionLoading}
            />
            
            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '10px 14px' }}>
              <Info size={16} color="#2563eb" />
              <span style={{ fontSize: '13px', color: '#1e40af' }}>
                Comments are required when rejecting or returning for revision.
              </span>
            </div>
            
            <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid #e2e8f0', display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'flex-end' }}>
              <Button 
                style={{ backgroundColor: '#ef4444', color: '#ffffff', border: 'none', height: '40px', padding: '0 20px', borderRadius: '8px', fontWeight: 500 }}
                icon={<XCircle size={18} />} 
                onClick={() => handleActionClick('REJECT')}
                disabled={actionLoading}
                isLoading={actionLoading && confirmDialog.action === 'REJECT'}
              >
                {actionLoading && confirmDialog.action === 'REJECT' ? 'Rejecting...' : 'Reject'}
              </Button>
              <Button 
                style={{ backgroundColor: '#fffbeb', color: '#d97706', border: '1px solid #fcd34d', height: '40px', padding: '0 20px', borderRadius: '8px', fontWeight: 500 }}
                icon={<RotateCcw size={18} />} 
                onClick={() => handleActionClick('RETURN')}
                disabled={actionLoading}
                isLoading={actionLoading && confirmDialog.action === 'RETURN'}
              >
                {actionLoading && confirmDialog.action === 'RETURN' ? 'Returning...' : 'Return for Revision'}
              </Button>
              <Button 
                style={{ backgroundColor: '#10b981', color: '#ffffff', border: 'none', height: '40px', padding: '0 20px', borderRadius: '8px', fontWeight: 500 }}
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
      ) : null}

      {/* Confirmation Dialog */}
      <Modal
        isOpen={confirmDialog.isOpen}
        onClose={() => { if (!actionLoading) setConfirmDialog({ isOpen: false, action: null }) }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {confirmDialog.action === 'APPROVE' && (
              <div style={{ padding: '8px', backgroundColor: '#dcfce7', color: '#16a34a', borderRadius: '50%', display: 'flex' }}>
                <CheckCircle size={24} />
              </div>
            )}
            {confirmDialog.action === 'RETURN' && (
              <div style={{ padding: '8px', backgroundColor: '#fef3c7', color: '#d97706', borderRadius: '50%', display: 'flex' }}>
                <RotateCcw size={24} />
              </div>
            )}
            {confirmDialog.action === 'REJECT' && (
              <div style={{ padding: '8px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '50%', display: 'flex' }}>
                <XCircle size={24} />
              </div>
            )}
            <span>
              {confirmDialog.action === 'APPROVE' ? 'Approve this Project Brief?' :
               confirmDialog.action === 'RETURN' ? 'Return this Project Brief for revision?' :
               confirmDialog.action === 'REJECT' ? 'Reject this Project Brief?' : 'Confirm action'}
            </span>
          </div>
        }
      >
        <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column' }}>
          {comments && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '8px' }}>
                Decision Comments
              </div>
              <div style={{ 
                padding: '12px 16px', 
                backgroundColor: confirmDialog.action === 'APPROVE' ? '#f0fdf4' : confirmDialog.action === 'RETURN' ? '#fffbeb' : '#fef2f2',
                border: `1px solid ${confirmDialog.action === 'APPROVE' ? '#bbf7d0' : confirmDialog.action === 'RETURN' ? '#fde68a' : '#fecaca'}`,
                borderRadius: '8px',
                color: '#1e293b',
                fontSize: '14px',
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap'
              }}>
                {comments}
              </div>
            </div>
          )}
          
          <div style={{ paddingTop: '16px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
            <Button 
              variant="outline" 
              onClick={() => setConfirmDialog({ isOpen: false, action: null })} 
              disabled={actionLoading}
              style={{ backgroundColor: '#f8fafc', color: '#475569', borderColor: '#e2e8f0', height: '40px' }}
            >
              Cancel
            </Button>
            
            {confirmDialog.action === 'APPROVE' && (
              <Button 
                style={{ backgroundColor: '#10b981', color: '#ffffff', border: 'none', height: '40px', padding: '0 20px', borderRadius: '8px', fontWeight: 500 }}
                icon={<CheckCircle size={18} />} 
                onClick={handleConfirmAction}
                disabled={actionLoading}
                isLoading={actionLoading}
              >
                Yes, Approve
              </Button>
            )}
            
            {confirmDialog.action === 'RETURN' && (
              <Button 
                style={{ backgroundColor: '#f59e0b', color: '#ffffff', border: 'none', height: '40px', padding: '0 20px', borderRadius: '8px', fontWeight: 500 }}
                icon={<RotateCcw size={18} />} 
                onClick={handleConfirmAction}
                disabled={actionLoading}
                isLoading={actionLoading}
              >
                Yes, Return
              </Button>
            )}
            
            {confirmDialog.action === 'REJECT' && (
              <Button 
                style={{ backgroundColor: '#ef4444', color: '#ffffff', border: 'none', height: '40px', padding: '0 20px', borderRadius: '8px', fontWeight: 500 }}
                icon={<XCircle size={18} />} 
                onClick={handleConfirmAction}
                disabled={actionLoading}
                isLoading={actionLoading}
              >
                Yes, Reject
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BdmReviewPage;

