/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSubmittedEstimates, getLatestConsolidatedEstimate, consolidateAndApprove, requestRevision, type DepartmentEstimateDTO, type ConsolidatedTechnicalEstimateDTO } from '../../services/TechnicalCostingApi';
import { getTechnicalProject, type TechnicalProjectDetailDTO } from '../../services/TechnicalProjectApi';
import { StatusBadge } from '../../components/StatusBadge';
import { LoadingState, EmptyState } from '../../components/FeedbackStates';
import { Button } from '../../components/Button';
import { Search, Calculator, CheckCircle, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { Textarea } from '../../components/Forms';
import './EstimateReviewDetailsPage.css';

const formatCurrency = (value: any): string => {
  if (value === null || value === undefined || value === '') return '—';
  const num = Number(value);
  if (isNaN(num)) return '—';
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2
  }).format(num);
};

const formatPercentage = (value: any): string => {
  if (value === null || value === undefined || value === '') return '—';
  const num = Number(value);
  if (isNaN(num)) return '—';
  return `${num}%`;
};

const formatDays = (value: any): string => {
  if (value === null || value === undefined || value === '') return '0';
  const num = Number(value);
  if (isNaN(num)) return '0';
  return num.toString();
};

export const EstimateReviewDetailsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<TechnicalProjectDetailDTO | null>(null);
  const [estimates, setEstimates] = useState<DepartmentEstimateDTO[]>([]);
  const [consolidatedEstimate, setConsolidatedEstimate] = useState<ConsolidatedTechnicalEstimateDTO | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Revision State
  const [revisionDeptId, setRevisionDeptId] = useState<string | null>(null);
  const [revisionNotes, setRevisionNotes] = useState('');

  const loadData = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      setError(null);
      
      const projData = await getTechnicalProject(projectId);
      setProject(projData);

      const estList = await getSubmittedEstimates(projectId);
      setEstimates(estList);
      
      try {
        const consolidated = await getLatestConsolidatedEstimate(projectId);
        setConsolidatedEstimate(consolidated);
      } catch (e: any) {
        if (e.response?.status === 404) {
          setConsolidatedEstimate(null);
        } else {
          console.error(e);
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load estimate details.');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  const handleRequestRevision = async (deptId: string) => {
    if (!projectId || !revisionNotes) return;
    try {
      setActionLoading(true);
      setError(null);
      await requestRevision(projectId, deptId, { notes: revisionNotes });
      setRevisionDeptId(null);
      setRevisionNotes('');
      await loadData();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to request revision.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConsolidateAndApprove = async () => {
    if (!projectId) return;
    if (!window.confirm("Are you sure you want to consolidate and approve these estimates? This will finalize the technical estimate version.")) return;
    try {
      setActionLoading(true);
      setError(null);
      await consolidateAndApprove(projectId);
      await loadData();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to consolidate and approve.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem' }}><LoadingState message="Loading estimate review details..." /></div>;
  }

  if (error || !project) {
    return (
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <EmptyState title="Unable to load project" message={error || 'Project not found.'} />
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
          <Button onClick={() => navigate('/admin/estimates')} variant="secondary">Back to Estimate Reviews</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="erd-container">
      
      {/* Page Header */}
      <div className="erd-page-header">
        <div className="erd-back-btn-wrapper">
          <Button 
            variant="secondary"
            onClick={() => navigate('/admin/estimates')}
            icon={<ArrowLeft size={16} />}
          >
            Back to Estimate Reviews
          </Button>
        </div>
        <div className="erd-header-main">
          <div>
            <h1 className="erd-header-title">Estimate Review</h1>
            <p className="erd-header-subtitle">{project.projectCode} &bull; {project.projectTitle}</p>
          </div>
          <div><StatusBadge status={project.status} /></div>
        </div>
      </div>
      
      {/* Project Summary */}
      <div className="erd-project-summary">
        <div className="erd-summary-item">
          <span className="erd-summary-label">Project Number</span>
          <span className="erd-summary-value">{project.projectCode}</span>
        </div>
        <div className="erd-summary-item">
          <span className="erd-summary-label">Project Name</span>
          <span className="erd-summary-value">{project.projectTitle}</span>
        </div>
        <div className="erd-summary-item">
          <span className="erd-summary-label">Client</span>
          <span className="erd-summary-value">{project.clientName || 'TBD'}</span>
        </div>
        <div className="erd-summary-item">
          <span className="erd-summary-label">Current Status</span>
          <div><StatusBadge status={project.status} /></div>
        </div>
      </div>

      {/* Consolidated Estimate */}
      <div>
        {consolidatedEstimate ? (
          <div className={`erd-consolidated-card ${consolidatedEstimate.status === 'APPROVED' ? 'approved' : ''}`}>
            <div className="erd-consolidated-header">
              <div className="erd-consolidated-title-area">
                <div className="erd-consolidated-title-row">
                  <h3 className={`erd-consolidated-title ${consolidatedEstimate.status === 'APPROVED' ? 'approved' : ''}`}>
                    Consolidated Estimate
                  </h3>
                  <span className={`erd-version-badge ${consolidatedEstimate.status === 'APPROVED' ? 'approved' : ''}`}>
                    v{consolidatedEstimate.versionNumber}
                  </span>
                  <StatusBadge status={consolidatedEstimate.status} />
                </div>
                {consolidatedEstimate.approvedByName && (
                  <p className="erd-consolidated-metadata">Approved by {consolidatedEstimate.approvedByName} &bull; {consolidatedEstimate.approvedAt ? format(new Date(consolidatedEstimate.approvedAt), 'MMM d, yyyy') : ''}</p>
                )}
              </div>
            </div>
            
            <div className="erd-financial-grid">
              <div className="erd-financial-item">
                <span className="erd-financial-label">Subtotal</span>
                <span className="erd-financial-value">{formatCurrency(consolidatedEstimate.subtotal)}</span>
              </div>
              <div className="erd-financial-item">
                <span className="erd-financial-label">Contingency</span>
                <span className="erd-financial-value">{formatCurrency(consolidatedEstimate.contingencyAmount)}</span>
              </div>
              <div className="erd-financial-item">
                <span className="erd-financial-label">Tax</span>
                <span className="erd-financial-value">{formatCurrency(consolidatedEstimate.taxAmount)}</span>
              </div>
              <div className="erd-financial-item">
                <span className="erd-financial-label">Margin</span>
                <span className="erd-financial-value">LKR 0.00</span>
              </div>
              <div className="erd-financial-item-final">
                <span className="erd-financial-label-final">Final Total</span>
                <span className="erd-financial-value-final">{formatCurrency(consolidatedEstimate.finalTotal)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="erd-empty-card">
            <Calculator className="erd-empty-icon" />
            <p className="erd-empty-text">No consolidated estimate has been created yet.</p>
          </div>
        )}
      </div>

      {/* Department Estimates */}
      <div className="erd-departments-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-text-primary)', margin: 0 }}>Department Estimates</h3>
          {estimates.length > 0 && (!consolidatedEstimate || consolidatedEstimate.status !== 'APPROVED') && (
            <Button 
              onClick={handleConsolidateAndApprove}
              disabled={actionLoading || estimates.some(e => e.status !== 'SUBMITTED' && e.status !== 'APPROVED')}
              isLoading={actionLoading}
              icon={<CheckCircle size={16} />}
              title="All departments must be SUBMITTED to consolidate."
            >
              Consolidate & Approve
            </Button>
          )}
        </div>

        {estimates.length > 0 ? (
          estimates.map(est => (
            <div key={est.departmentId} className="erd-department-card">
              <div className="erd-department-header">
                <div className="erd-department-title-area">
                  <div className="erd-department-title-row">
                    <h4 className="erd-department-title">{est.departmentName}</h4>
                    <StatusBadge status={est.status} />
                  </div>
                  <div className="erd-department-metadata-row">
                    <span className="erd-version-badge">v{est.versionNumber}</span>
                    <span>&bull;</span>
                    <span>Submitted by {est.submittedByName}</span>
                    <span>&bull;</span>
                    <span>{est.submittedAt ? format(new Date(est.submittedAt), 'MMM d, yyyy HH:mm') : '-'}</span>
                  </div>
                </div>
                <div className="erd-department-actions">
                    {est.status === 'SUBMITTED' && (!consolidatedEstimate || consolidatedEstimate.status !== 'APPROVED') && (
                      <Button 
                        style={{ backgroundColor: 'var(--color-warning-bg)', color: 'var(--color-warning)', borderColor: 'var(--color-warning-bg)' }}
                        onClick={() => setRevisionDeptId(est.departmentId)}
                      >
                        Request Revision
                      </Button>
                    )}
                </div>
              </div>

              <div className="erd-financial-summary">
                  <div className="erd-financial-summary-item">
                      <span className="erd-financial-summary-label">Subtotal</span>
                      <span className="erd-financial-summary-value">{formatCurrency(est.subtotal)}</span>
                  </div>
                  <div className="erd-financial-summary-item">
                      <span className="erd-financial-summary-label">Contingency {formatPercentage(est.contingencyPercentage)}</span>
                      <span className="erd-financial-summary-value">{formatCurrency(est.contingencyAmount)}</span>
                  </div>
                  <div className="erd-financial-summary-item">
                      <span className="erd-financial-summary-label">Tax {formatPercentage(est.taxPercentage)}</span>
                      <span className="erd-financial-summary-value">{formatCurrency(est.taxAmount)}</span>
                  </div>
                  <div className="erd-financial-summary-item">
                      <span className="erd-financial-summary-label">Margin {formatPercentage(est.marginPercentage)}</span>
                      <span className="erd-financial-summary-value">{formatCurrency(est.marginAmount)}</span>
                  </div>
                  <div className="erd-financial-summary-item-final">
                      <span className="erd-financial-summary-label-final">Final Total</span>
                      <span className="erd-financial-summary-value-final">{formatCurrency(est.finalTotal)}</span>
                  </div>
              </div>

              <div className="erd-timeline-card">
                  <div className="erd-timeline-icon-wrapper">
                      <Calculator className="erd-timeline-icon" />
                  </div>
                  <div className="erd-timeline-info">
                      <span className="erd-timeline-label">Timeline</span>
                      <span className="erd-timeline-value">
                        {formatDays((est.designDurationDays || 0) + (est.developmentDurationDays || 0) + (est.testingDurationDays || 0) + (est.procurementDurationDays || 0) + (est.installationDurationDays || 0) + (est.trainingDurationDays || 0) + (est.deliveryDurationDays || 0))} Days Total
                      </span>
                  </div>
              </div>

              <div className="erd-table-section">
                  <span className="erd-table-section-title">Line Items</span>
                  {est.lineItems && est.lineItems.length > 0 ? (
                    <div className="erd-table-container">
                      <table className="erd-table">
                        <thead>
                          <tr>
                            <th>Category</th>
                            <th>Description</th>
                            <th className="erd-table-align-right">Qty</th>
                            <th className="erd-table-align-right">Unit Cost</th>
                            <th className="erd-table-align-right">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(est.lineItems || []).map((item, idx) => (
                            <tr key={item.id || idx}>
                              <td className="erd-table-category">{item.category}</td>
                              <td className="erd-table-desc">{item.description}</td>
                              <td className="erd-table-align-right">
                                <span className="erd-table-qty">{item.quantity}</span>
                                <span className="erd-table-qty-uom">{item.unitOfMeasure}</span>
                              </td>
                              <td className="erd-table-align-right erd-table-unitcost">{formatCurrency(item.unitCost)}</td>
                              <td className="erd-table-align-right erd-table-total">{formatCurrency(item.totalCost)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="erd-empty-table">
                      <p>No line items have been added.</p>
                    </div>
                  )}
              </div>

              {revisionDeptId === est.departmentId && (
                <div style={{ marginTop: '24px', padding: '20px', border: '1px solid var(--color-danger-bg)', backgroundColor: 'var(--color-danger-bg)', borderRadius: '8px' }}>
                  <h5 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-danger)', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-danger)' }}></span>
                    Request Revision
                  </h5>
                  <Textarea 
                    value={revisionNotes}
                    onChange={(e: any) => setRevisionNotes(e.target.value)}
                    placeholder="Explain what needs to be changed..."
                    rows={3}
                  />
                  <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                    <Button 
                      style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', borderColor: 'var(--color-danger-bg)' }}
                      onClick={() => handleRequestRevision(est.departmentId)}
                      disabled={actionLoading || !revisionNotes}
                    >
                      Submit Request
                    </Button>
                    <Button 
                      variant="secondary" 
                      onClick={() => { setRevisionDeptId(null); setRevisionNotes(''); }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="erd-department-footer">
                  <Button 
                    variant="secondary" 
                    onClick={() => navigate(`/hod/estimates/${projectId}/department/${est.departmentId}`)}
                  >
                    <Search size={16} style={{ marginRight: '8px' }} />
                    View Full Estimate
                  </Button>
              </div>
            </div>
          ))
        ) : (
          <EmptyState title="No estimates found" message="Departments have not started or submitted their estimates yet." />
        )}
      </div>
    </div>
  );
};


