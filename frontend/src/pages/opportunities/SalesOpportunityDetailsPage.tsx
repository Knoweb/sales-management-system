import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOpportunity } from '../../api/opportunityApi';
import type { SalesOpportunityDTO } from '../../api/opportunityApi';
import { initializeProjectBrief } from '../../api/projectBriefApi';
import { getBdmApprovals, getClientVerifications, getWorkflowHistory, type BdmApprovalDTO, type ClientVerificationDTO, type WorkflowHistoryDTO } from '../../services/ApprovalApi';
import { format } from 'date-fns';
import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/Card';
import { Tabs, type TabItem } from '../../components/Tabs';
import { StatusBadge, getStatusVariant } from '../../components/StatusBadge';
import { LoadingState, ErrorState, EmptyState } from '../../components/FeedbackStates';
import { FileText, Activity, LayoutDashboard, TrendingUp, CheckCircle, ExternalLink, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ClientVerificationCard } from '../../components/clients/ClientVerificationCard';
import { VirtualTourHistory } from '../../features/virtualtour/components/VirtualTourHistory';

const getWorkflowVariant = (status: string) => {
  const s = status.toUpperCase().replace(/\s+/g, '_');
  if (['APPROVED', 'VERIFIED', 'COMPLETED', 'CONFIRMED'].includes(s)) return 'success';
  if (['PENDING', 'IN_REVIEW', 'SUBMITTED', 'CHANGES_REQUIRED', 'RETURNED_FOR_REVISION'].includes(s)) return 'warning';
  if (['REJECTED', 'FAILED'].includes(s)) return 'error';
  return 'neutral';
};

const SalesOpportunityDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [opportunity, setOpportunity] = useState<SalesOpportunityDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initializingBrief, setInitializingBrief] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  const [bdmApprovals, setBdmApprovals] = useState<BdmApprovalDTO[]>([]);
  const [clientVerifications, setClientVerifications] = useState<ClientVerificationDTO[]>([]);
  const [workflowHistory, setWorkflowHistory] = useState<WorkflowHistoryDTO[]>([]);

  const { user } = useAuth();
  const canReadBrief = !!user?.permissions?.includes('PROJECT_BRIEF_READ');
  const canCreateBrief = !!user?.permissions?.includes('PROJECT_BRIEF_CREATE');
  const canCreateVerification = !!user?.permissions?.includes('CLIENT_VERIFICATION_CREATE');

  const loadData = useCallback(async (oppId: string) => {
    try {
      setLoading(true);
      setError(null);
      const opp = await getOpportunity(oppId);
      setOpportunity(opp);
      
      try {
        const [appr, verif, hist] = await Promise.all([
          getBdmApprovals(oppId),
          getClientVerifications(oppId),
          getWorkflowHistory(oppId)
        ]);
        setBdmApprovals(appr);
        setClientVerifications(verif);
        setWorkflowHistory(hist);
      } catch (e) {
        console.error("Could not load approval data", e);
      }
      
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Failed to load opportunity');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadData(id);
    }
  }, [id, loadData]);

  const handleStartBrief = async () => {
    if (!id) return;
    try {
      setInitializingBrief(true);
      await initializeProjectBrief(id);
      await loadData(id);
      navigate(`/opportunities/${id}/project-brief`);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      const msg = e.response?.data?.message || '';
      if (msg.includes('already exists')) {
        await loadData(id);
        navigate(`/opportunities/${id}/project-brief`);
      } else {
        setError(msg || 'Failed to initialize project brief');
      }
    } finally {
      setInitializingBrief(false);
    }
  };

  const handleOpenBrief = () => {
    if (!id) return;
    navigate(`/opportunities/${id}/project-brief`);
  };

  if (loading) return <div className="p-6"><LoadingState message="Loading opportunity details..." /></div>;
  if (error) return <div className="p-6"><ErrorState message={error} onRetry={() => id && loadData(id)} /></div>;
  if (!opportunity) return <div className="p-6"><ErrorState message="Opportunity not found" /></div>;

  const tabs: TabItem[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
    { id: 'activity', label: 'Activity Timeline', icon: <Activity size={18} /> },
    { id: 'approvals', label: 'Approvals & Verification', icon: <CheckCircle size={18} /> },
    { id: 'virtualtours', label: 'Virtual Tours', icon: <Activity size={18} /> }
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 w-full">
      <div style={{ marginBottom: '20px' }}>
        <button
          type="button"
          onClick={() => navigate('/opportunities')}
          style={{
            height: '40px',
            paddingInline: '12px',
            backgroundColor: 'var(--color-surface-secondary)',
            color: 'var(--color-text-secondary)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            boxShadow: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer'
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 19-7-7 7-7"/>
            <path d="M19 12H5"/>
          </svg>
          Back to Opportunities
        </button>
      </div>

      <PageHeader 
        title={opportunity.title}
        icon={<TrendingUp size={24} />}
        description={`Opportunity Number: ${opportunity.opportunityNumber}`}
        actionElement={
          <div className="flex items-center gap-3">
            <StatusBadge status={opportunity.stage} variant={getStatusVariant(opportunity.stage)} />
            
            {(() => {
              const hasProjectBriefRecord = Boolean((opportunity as any).projectBriefId) || Boolean(opportunity.projectBrief?.id);
              const hasStartedBrief = hasProjectBriefRecord && Boolean(opportunity.projectBrief && (
                (opportunity.projectBrief.currentVersionNumber && opportunity.projectBrief.currentVersionNumber > 0) || 
                opportunity.projectBrief.status !== 'DRAFT'
              ));
              
              if (!hasStartedBrief && canCreateBrief) {
                return (
                  <button
                    type="button"
                    onClick={handleStartBrief}
                    disabled={initializingBrief}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      width: 'fit-content',
                      padding: '6px 12px',
                      borderRadius: '9999px',
                      background: 'var(--color-primary-soft)',
                      color: 'var(--color-primary-active)',
                      border: '1px solid #bfdbfe',
                      fontSize: '14px',
                      fontWeight: 500,
                      lineHeight: 1,
                      cursor: 'pointer',
                      gap: '6px'
                    }}
                  >
                    {initializingBrief ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                    Open Project Brief
                  </button>
                );
              }

              if (hasStartedBrief && canReadBrief) {
                return (
                  <button
                    type="button"
                    onClick={handleOpenBrief}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      width: 'fit-content',
                      padding: '6px 12px',
                      borderRadius: '9999px',
                      background: 'var(--color-primary-soft)',
                      color: 'var(--color-primary-active)',
                      border: '1px solid #bfdbfe',
                      fontSize: '14px',
                      fontWeight: 500,
                      lineHeight: 1,
                      cursor: 'pointer',
                      gap: '6px'
                    }}
                  >
                    <ExternalLink size={14} />
                    View Project Brief
                  </button>
                );
              }

              return null;
            })()}
          </div>
        }
      />



      {['BRIEF_IN_PROGRESS', 'BRIEF_SUBMITTED'].includes(opportunity.stage) && (
        <div style={{ backgroundColor: 'var(--color-warning-bg)', border: '1px solid #fde68a', borderRadius: '10px', padding: '16px', display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
          <FileText size={20} style={{ color: 'var(--color-warning)', marginTop: '2px', flexShrink: 0 }} />
          <div>
            <p style={{ margin: 0, color: '#1e293b', fontSize: '15px', fontWeight: 600 }}>Project Brief is active</p>
            <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: '13px', lineHeight: 1.5 }}>This opportunity has a project brief in progress or submitted. You can access it via the project briefs section.</p>
          </div>
        </div>
      )}

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <Card>
              <div style={{ padding: '24px' }}>
                <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--color-border)' }}>
                  <h2 style={{ margin: 0, color: 'var(--color-text-primary)', fontSize: '20px', fontWeight: 700, lineHeight: 1.3 }}>
                    Opportunity Overview
                  </h2>
                  <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: '14px' }}>
                    Basic opportunity details
                  </p>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                  <div style={{ padding: '16px', backgroundColor: 'var(--color-surface-secondary)', border: '1px solid var(--color-border)', borderRadius: '10px' }}>
                    <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Client</p>
                    <p style={{ margin: '7px 0 0', color: 'var(--color-text-primary)', fontSize: '16px', fontWeight: 600, lineHeight: 1.5, wordBreak: 'break-word' }}>{opportunity.clientName}</p>
                  </div>
                  
                  <div style={{ padding: '16px', backgroundColor: 'var(--color-surface-secondary)', border: '1px solid var(--color-border)', borderRadius: '10px' }}>
                    <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Value</p>
                    <p style={{ margin: '7px 0 0', color: 'var(--color-text-primary)', fontSize: '16px', fontWeight: 600, lineHeight: 1.5, wordBreak: 'break-word' }}>LKR {opportunity.estimatedValue.toLocaleString()}</p>
                  </div>
                  
                  <div style={{ padding: '16px', backgroundColor: 'var(--color-surface-secondary)', border: '1px solid var(--color-border)', borderRadius: '10px' }}>
                    <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Product Category</p>
                    <p style={{ margin: '7px 0 0', color: 'var(--color-text-primary)', fontSize: '16px', fontWeight: 600, lineHeight: 1.5, wordBreak: 'break-word' }}>{opportunity.productCategoryName || 'N/A'}</p>
                  </div>
                  
                  <div style={{ padding: '16px', backgroundColor: 'var(--color-surface-secondary)', border: '1px solid var(--color-border)', borderRadius: '10px' }}>
                    <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Assigned Sales Officer</p>
                    <p style={{ margin: '7px 0 0', color: 'var(--color-text-primary)', fontSize: '16px', fontWeight: 600, lineHeight: 1.5, wordBreak: 'break-word' }}>{opportunity.assignedSalesOfficerName || 'Unassigned'}</p>
                  </div>
                  
                  <div style={{ padding: '16px', backgroundColor: 'var(--color-surface-secondary)', border: '1px solid var(--color-border)', borderRadius: '10px' }}>
                    <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Expected Close Date</p>
                    <p style={{ margin: '7px 0 0', color: 'var(--color-text-primary)', fontSize: '16px', fontWeight: 600, lineHeight: 1.5, wordBreak: 'break-word' }}>
                      {opportunity.expectedCloseDate ? format(new Date(opportunity.expectedCloseDate), 'MMM d, yyyy') : 'N/A'}
                    </p>
                  </div>
                  
                  <div style={{ padding: '16px', backgroundColor: 'var(--color-surface-secondary)', border: '1px solid var(--color-border)', borderRadius: '10px' }}>
                    <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Stage</p>
                    <div style={{ margin: '7px 0 0' }}>
                      <StatusBadge status={opportunity.stage} variant={getStatusVariant(opportunity.stage)} />
                    </div>
                  </div>
                </div>
                
                <div style={{ marginTop: '40px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--color-border)' }}>
                  <h2 style={{ margin: 0, color: 'var(--color-text-primary)', fontSize: '18px', fontWeight: 700, lineHeight: 1.3 }}>
                    Workflow Status
                  </h2>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                  <div style={{ padding: '16px', backgroundColor: 'var(--color-surface-secondary)', border: '1px solid var(--color-border)', borderRadius: '10px' }}>
                    <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>BDM Approval</p>
                    <div style={{ margin: '7px 0 0' }}>
                      {(() => {
                        const currentVersion = opportunity.projectBrief?.currentVersionNumber || 0;
                        const relevantApproval = bdmApprovals.find(a => a.projectBriefVersionNumber === currentVersion) || (bdmApprovals.length > 0 ? bdmApprovals[0] : null);
                        
                        if (relevantApproval) {
                          let statusLabel = relevantApproval.status;
                          if (statusLabel === 'APPROVED') statusLabel = 'Approved';
                          else if (statusLabel === 'PENDING') statusLabel = 'Pending';
                          else if (statusLabel === 'RETURNED_FOR_REVISION') statusLabel = 'Returned for Revision';
                          else if (statusLabel === 'REJECTED') statusLabel = 'Rejected';
                          
                          const variant = getWorkflowVariant(statusLabel === 'Approved' ? 'APPROVED' : relevantApproval.status);
                          return <StatusBadge status={statusLabel} variant={variant} />;
                        }
                        
                        return <StatusBadge status="Not Started" variant="neutral" />;
                      })()}
                    </div>
                  </div>
                  
                  <div style={{ padding: '16px', backgroundColor: 'var(--color-surface-secondary)', border: '1px solid var(--color-border)', borderRadius: '10px' }}>
                    <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Client Verification</p>
                    <div style={{ margin: '7px 0 0' }}>
                      {(() => {
                        const currentVersion = opportunity.projectBrief?.currentVersionNumber || 0;
                        const relevantVerification = clientVerifications.find(v => v.projectBriefVersionNumber === currentVersion) || (clientVerifications.length > 0 ? clientVerifications[0] : null);
                        
                        if (relevantVerification) {
                          let statusLabel = relevantVerification.status;
                          if (statusLabel === 'CONFIRMED' || statusLabel === 'CLIENT_VERIFIED' || statusLabel === 'APPROVED') {
                            statusLabel = 'Approved';
                          } else if (statusLabel === 'PENDING') {
                            statusLabel = 'Pending Client Approval';
                          }
                          
                          const variant = getWorkflowVariant(statusLabel === 'Approved' ? 'APPROVED' : relevantVerification.status);
                          return <StatusBadge status={statusLabel} variant={variant} />;
                        }
                        
                        return <StatusBadge status="Not Started" variant="neutral" />;
                      })()}
                    </div>
                  </div>
                </div>

                {opportunity.description && (
                  <>
                    <div style={{ marginTop: '40px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--color-border)' }}>
                      <h2 style={{ margin: 0, color: 'var(--color-text-primary)', fontSize: '18px', fontWeight: 700, lineHeight: 1.3 }}>
                        Description
                      </h2>
                    </div>
                    <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '15px', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                      {opportunity.description}
                    </p>
                  </>
                )}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'activity' && (
          <Card>
            <div className="flex-between border-b border-border pb-4" style={{ marginBottom: '2rem' }}>
              <h3 className="text-lg font-semibold text-text-primary">Activity Timeline</h3>
            </div>
            
            {opportunity.activities.length === 0 ? (
              <EmptyState 
                title="No activities added"
                message="This opportunity has no activity history."
              />
            ) : (
              <div style={{ display: 'flex', overflowX: 'auto', paddingBottom: '16px' }}>
                {opportunity.activities.map((activity, index) => {
                  const isLast = index === opportunity.activities.length - 1;
                  return (
                    <div key={activity.id} style={{ minWidth: '280px', flex: '0 0 25%', position: 'relative' }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', zIndex: 1, flexShrink: 0 }} />
                        <div style={{ flex: 1, height: '2px', backgroundColor: isLast ? 'transparent' : 'var(--color-border)' }} />
                      </div>
                      
                      <div style={{ paddingRight: '24px' }}>
                        <span style={{ 
                          display: 'inline-block', 
                          padding: '4px 8px', 
                          backgroundColor: '#e0f2fe', 
                          color: '#0369a1', 
                          borderRadius: '6px', 
                          fontSize: '11px', 
                          fontWeight: 700, 
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                          marginBottom: '12px' 
                        }}>
                          SYSTEM EVENT
                        </span>
                        <p style={{ margin: '0 0 8px', fontSize: '14px', color: 'var(--color-text-primary)', fontWeight: 500, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                          {activity.description}
                        </p>
                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                          {format(new Date(activity.createdAt), 'MMM d, yyyy • h:mm a')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        )}

        {activeTab === 'approvals' && (
          <div className="space-y-6">
            <Card>
              <div className="flex-between border-b border-border pb-4" style={{ marginBottom: '20px' }}>
                <h3 className="text-lg font-semibold text-text-primary">BDM Approvals</h3>
              </div>
              {bdmApprovals.length === 0 ? (
                <EmptyState 
                  title="No approval history"
                  message="No BDM approval records are available."
                />
              ) : (
                <div className="space-y-4">
                  {bdmApprovals.map(a => (
                    <div key={a.id} style={{ padding: '20px', backgroundColor: 'var(--color-surface-secondary)', border: '1px solid var(--color-border)', borderRadius: '10px' }}>
                      <div style={{ marginBottom: '16px' }}>
                        <StatusBadge status={a.status} variant={getWorkflowVariant(a.status)} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                        <div>
                          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Decision Date</p>
                          <p style={{ margin: '7px 0 0', color: 'var(--color-text-primary)', fontSize: '15px', fontWeight: 500 }}>
                            {a.createdAt ? format(new Date(a.createdAt), 'MMM d, yyyy • h:mm a') : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Decision By</p>
                          <p style={{ margin: '7px 0 0', color: 'var(--color-text-primary)', fontSize: '15px', fontWeight: 500 }}>
                            {a.decisionMakerName || 'Pending'}
                          </p>
                        </div>
                      </div>
                      {a.comments && a.comments.length > 0 && (
                        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
                          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Comments</p>
                          {a.comments.map(c => (
                            <p key={c.id} style={{ margin: '7px 0 0', color: 'var(--color-text-secondary)', fontSize: '14px', lineHeight: 1.5 }}>
                              {c.comment} <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>— {c.createdByName}</span>
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
            
            {(() => {
              const currentVersion = opportunity?.projectBrief?.currentVersionNumber || 0;
              const isBdmApprovedForCurrentVersion = bdmApprovals.length > 0 
                && bdmApprovals[0].projectBriefVersionNumber === currentVersion 
                && bdmApprovals[0].status === 'APPROVED';

              return (
                <ClientVerificationCard
                  verifications={clientVerifications}
                  opportunityId={opportunity.id}
                  canCreate={canCreateVerification}
                  onRefresh={() => id && loadData(id)}
                  isBdmApprovedForCurrentVersion={isBdmApprovedForCurrentVersion}
                />
              );
            })()}
            
            <Card>
              <div className="flex-between border-b border-border pb-4" style={{ marginBottom: '20px' }}>
                <h3 className="text-lg font-semibold text-text-primary">Workflow History</h3>
              </div>
              {workflowHistory.length === 0 ? (
                <EmptyState 
                  title="No workflow history"
                  message="No workflow events are available."
                />
              ) : (
                <div style={{ paddingLeft: '8px' }}>
                  {workflowHistory.map((h, index) => {
                    const isLast = index === workflowHistory.length - 1;
                    return (
                      <div key={h.id} style={{ display: 'flex', position: 'relative' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '16px' }}>
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', marginTop: '6px', zIndex: 1 }} />
                          <div style={{ width: '2px', flex: 1, backgroundColor: isLast ? 'transparent' : 'var(--color-border)', marginTop: '4px', marginBottom: '4px' }} />
                        </div>
                        <div style={{ paddingBottom: '24px', flex: 1 }}>
                          <p style={{ margin: '0 0 4px', fontSize: '14px', color: 'var(--color-text-primary)', fontWeight: 600 }}>
                            {h.action}
                          </p>
                          <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-muted)' }}>
                            by {h.actorName || 'System'}
                          </p>
                          <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                            {h.createdAt ? format(new Date(h.createdAt), 'MMM d, yyyy • h:mm a') : 'N/A'}
                          </p>
                          {h.comments && (
                            <p style={{ margin: '8px 0 0', fontSize: '13px', color: 'var(--color-text-secondary)', fontStyle: 'italic', backgroundColor: 'var(--color-surface-secondary)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
                              "{h.comments}"
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        )}

        {activeTab === 'virtualtours' && <VirtualTourHistory opportunityId={id!} />}
      </div>
    </div>
  );
};

export default SalesOpportunityDetailsPage;



