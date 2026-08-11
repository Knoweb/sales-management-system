/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSubmittedEstimates, getLatestConsolidatedEstimate, consolidateAndApprove, requestRevision, type DepartmentEstimateDTO, type ConsolidatedTechnicalEstimateDTO } from '../../services/TechnicalCostingApi';
import { getTechnicalProject, type TechnicalProjectDetailDTO } from '../../services/TechnicalProjectApi';
import { Card } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { LoadingState, EmptyState } from '../../components/FeedbackStates';
import { Button } from '../../components/Button';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/Table';
import { Search, Calculator, CheckCircle, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { Textarea } from '../../components/Forms';

const formatCurrency = (value: any): string => {
  if (value === null || value === undefined || value === '') return '—';
  const num = Number(value);
  if (isNaN(num)) return '—';
  return `$${num.toFixed(2)}`;
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
    return <div className="p-8"><LoadingState message="Loading estimate review details..." /></div>;
  }

  if (error || !project) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <EmptyState title="Unable to load project" message={error || 'Project not found.'} />
        <div className="mt-8 flex justify-center">
          <Button onClick={() => navigate('/admin/estimates')} variant="secondary">Back to Estimate Reviews</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[90rem] mx-auto pb-12 px-4 sm:px-6 lg:px-8 pt-6">
      
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/admin/estimates')}
          className="p-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors shadow-sm"
          title="Back to Estimate Reviews"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Estimate Review</h1>
          </div>
        </div>
      </div>
      
      {/* Project Summary */}
      <Card className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Project Number</span>
            <span className="font-semibold text-gray-900 text-lg">{project.projectCode}</span>
          </div>
          <div>
            <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Project Name</span>
            <span className="font-semibold text-gray-900 text-lg">{project.projectTitle}</span>
          </div>
          <div>
            <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Client</span>
            <span className="font-semibold text-gray-900 text-lg">{project.clientName || 'TBD'}</span>
          </div>
          <div>
            <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Current Status</span>
            <div><StatusBadge status={project.status} /></div>
          </div>
        </div>
      </Card>

      {/* Consolidated Estimate */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4 ml-1">Consolidated Estimate</h3>
        {consolidatedEstimate ? (
          <Card className={`p-8 border-2 rounded-2xl shadow-sm overflow-hidden relative ${consolidatedEstimate.status === 'APPROVED' ? 'border-green-500 bg-green-50/30' : 'border-gray-200 bg-white'}`}>
            {consolidatedEstimate.status === 'APPROVED' && (
              <div className="absolute top-0 left-0 w-1.5 h-full bg-green-500"></div>
            )}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className={`text-xl font-bold mb-1 ${consolidatedEstimate.status === 'APPROVED' ? 'text-green-900' : 'text-gray-900'}`}>
                  Consolidated Estimate 
                  <span className={`font-medium text-base ml-2 ${consolidatedEstimate.status === 'APPROVED' ? 'text-green-700' : 'text-gray-500'}`}>
                    (v{consolidatedEstimate.versionNumber})
                  </span>
                </h3>
                {consolidatedEstimate.approvedByName && (
                  <p className="text-sm text-gray-600 font-medium">Approved by {consolidatedEstimate.approvedByName} on {consolidatedEstimate.approvedAt ? format(new Date(consolidatedEstimate.approvedAt), 'MMM d, yyyy') : ''}</p>
                )}
              </div>
              <StatusBadge status={consolidatedEstimate.status} />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Subtotal</p>
                <p className="font-semibold text-gray-900 text-lg">{formatCurrency(consolidatedEstimate.subtotal)}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Contingency</p>
                <p className="font-semibold text-gray-900 text-lg">{formatCurrency(consolidatedEstimate.contingencyAmount)}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Tax</p>
                <p className="font-semibold text-gray-900 text-lg">{formatCurrency(consolidatedEstimate.taxAmount)}</p>
              </div>
              <div className="pl-4 border-l-2 border-gray-100">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Final Total</p>
                <p className="font-bold text-primary-700 text-2xl">{formatCurrency(consolidatedEstimate.finalTotal)}</p>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-12 border-gray-200 border-dashed bg-gray-50/50 rounded-2xl shadow-none flex flex-col items-center justify-center text-center">
            <Calculator className="h-10 w-10 text-gray-400 mb-4" />
            <p className="text-gray-500 text-base font-medium">No consolidated estimate has been created yet.</p>
          </Card>
        )}
      </div>

      {/* Department Estimates */}
      <Card className="p-8 rounded-2xl border-gray-200 shadow-sm bg-white">
        <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
          <h3 className="text-xl font-semibold text-gray-900">Department Estimates</h3>
          {estimates.length > 0 && (!consolidatedEstimate || consolidatedEstimate.status !== 'APPROVED') && (
            <Button 
              onClick={handleConsolidateAndApprove}
              disabled={actionLoading || estimates.some(e => e.status !== 'SUBMITTED' && e.status !== 'APPROVED')}
              isLoading={actionLoading}
              icon={<CheckCircle className="w-4 h-4" />}
              title="All departments must be SUBMITTED to consolidate."
            >
              Consolidate & Approve
            </Button>
          )}
        </div>

        {estimates.length > 0 ? (
          <div className="space-y-8">
            {estimates.map(est => (
              <div key={est.departmentId} className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-bold text-gray-900 text-lg">{est.departmentName}</h4>
                      <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-0.5 rounded-full">v{est.versionNumber}</span>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">
                      Submitted by <span className="text-gray-700">{est.submittedByName}</span> on {est.submittedAt ? format(new Date(est.submittedAt), 'MMM d, yyyy HH:mm') : '-'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                      <StatusBadge status={est.status} />
                      {est.status === 'SUBMITTED' && (!consolidatedEstimate || consolidatedEstimate.status !== 'APPROVED') && (
                        <Button 
                          className="text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 shadow-sm text-xs py-1.5 h-auto" 
                          onClick={() => setRevisionDeptId(est.departmentId)}
                        >
                          Request Revision
                        </Button>
                      )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-6 bg-gray-50/80 p-5 rounded-lg mb-6 border border-gray-100">
                    <div><span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Subtotal</span><span className="font-semibold text-gray-900 text-base">{formatCurrency(est.subtotal)}</span></div>
                    <div><span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Contingency</span><span className="font-semibold text-gray-900 text-base">{formatPercentage(est.contingencyPercentage)} <span className="text-gray-500 font-medium text-sm ml-1">({formatCurrency(est.contingencyAmount)})</span></span></div>
                    <div><span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Tax</span><span className="font-semibold text-gray-900 text-base">{formatPercentage(est.taxPercentage)} <span className="text-gray-500 font-medium text-sm ml-1">({formatCurrency(est.taxAmount)})</span></span></div>
                    <div><span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Margin</span><span className="font-semibold text-gray-900 text-base">{formatPercentage(est.marginPercentage)} <span className="text-gray-500 font-medium text-sm ml-1">({formatCurrency(est.marginAmount)})</span></span></div>
                    <div><span className="block text-xs font-bold text-primary-600 uppercase tracking-wider mb-1">Final Total</span><span className="font-bold text-primary-700 text-lg">{formatCurrency(est.finalTotal)}</span></div>
                </div>

                <div className="mb-6 flex items-center justify-between bg-white border border-gray-200 p-4 rounded-lg">
                    <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <Calculator className="w-4 h-4 text-gray-400" /> Timeline
                    </span>
                    <span className="font-semibold text-gray-900 bg-gray-100 px-3 py-1 rounded-md">
                      {formatDays((est.designDurationDays || 0) + (est.developmentDurationDays || 0) + (est.testingDurationDays || 0) + (est.procurementDurationDays || 0) + (est.installationDurationDays || 0) + (est.trainingDurationDays || 0) + (est.deliveryDurationDays || 0))} Days Total
                    </span>
                </div>

                <div className="mb-6">
                    <span className="block text-sm font-bold text-gray-700 mb-3">Line Items</span>
                    {est.lineItems && est.lineItems.length > 0 ? (
                      <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white">
                        <Table>
                          <TableHead>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHeader className="text-xs font-bold text-gray-600 uppercase tracking-wider py-3">Category</TableHeader>
                              <TableHeader className="text-xs font-bold text-gray-600 uppercase tracking-wider py-3">Description</TableHeader>
                              <TableHeader className="text-xs font-bold text-gray-600 uppercase tracking-wider py-3 text-right">Qty</TableHeader>
                              <TableHeader className="text-xs font-bold text-gray-600 uppercase tracking-wider py-3 text-right">Unit Cost</TableHeader>
                              <TableHeader className="text-xs font-bold text-gray-600 uppercase tracking-wider py-3 text-right">Total</TableHeader>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {(est.lineItems || []).map((item, idx) => (
                              <TableRow key={item.id || idx} className="hover:bg-gray-50/50 transition-colors">
                                <TableCell className="text-sm text-gray-700 font-medium py-3 border-b border-gray-100">{item.category}</TableCell>
                                <TableCell className="text-sm text-gray-600 py-3 border-b border-gray-100">{item.description}</TableCell>
                                <TableCell className="text-sm text-gray-700 font-medium py-3 border-b border-gray-100 text-right">{item.quantity} <span className="text-gray-400 font-normal">{item.unitOfMeasure}</span></TableCell>
                                <TableCell className="text-sm text-gray-700 py-3 border-b border-gray-100 text-right">{formatCurrency(item.unitCost)}</TableCell>
                                <TableCell className="text-sm font-semibold text-gray-900 py-3 border-b border-gray-100 text-right">{formatCurrency(item.totalCost)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg border border-gray-200 border-dashed p-6 text-center">
                        <p className="text-sm text-gray-500 italic">No line items have been added.</p>
                      </div>
                    )}
                </div>

                {revisionDeptId === est.departmentId && (
                  <div className="mt-6 p-5 border border-red-200 bg-red-50/80 rounded-lg shadow-inner">
                    <h5 className="text-sm font-bold text-red-800 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                      Request Revision
                    </h5>
                    <Textarea 
                      value={revisionNotes}
                      onChange={(e: any) => setRevisionNotes(e.target.value)}
                      placeholder="Explain what needs to be changed..."
                      rows={3}
                      className="bg-white border-red-200 focus:border-red-400 focus:ring-red-400"
                    />
                    <div className="mt-4 flex space-x-3">
                      <Button 
                        className="text-red-700 bg-red-100 hover:bg-red-200 border border-red-300 shadow-sm" 
                        onClick={() => handleRequestRevision(est.departmentId)}
                        disabled={actionLoading || !revisionNotes}
                      >
                        Submit Request
                      </Button>
                      <Button 
                        variant="secondary" 
                        className="bg-white hover:bg-gray-50 text-gray-700 border-gray-300 shadow-sm"
                        onClick={() => { setRevisionDeptId(null); setRevisionNotes(''); }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="mt-6 flex justify-end border-t border-gray-100 pt-5">
                    <Button 
                      variant="secondary" 
                      className="bg-white hover:bg-gray-50 border-gray-200 shadow-sm text-primary-700 font-medium"
                      onClick={() => navigate(`/hod/estimates/${projectId}/department/${est.departmentId}`)}
                    >
                      <Search className="w-4 h-4 mr-2 inline-block text-primary-500" />
                      View Full Estimate
                    </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No estimates found" message="Departments have not started or submitted their estimates yet." />
        )}
      </Card>
    </div>
  );
};
