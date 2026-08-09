/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSubmittedEstimates, getLatestConsolidatedEstimate, consolidateAndApprove, requestRevision, type DepartmentEstimateDTO, type ConsolidatedTechnicalEstimateDTO } from '../../services/TechnicalCostingApi';
import { getTechnicalProjects, type TechnicalProjectSummaryDTO } from '../../services/TechnicalProjectApi';
import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { LoadingState, EmptyState } from '../../components/FeedbackStates';
import { Button } from '../../components/Button';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/Table';
import { Search, Calculator, CheckCircle } from 'lucide-react';
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

export const AdminEstimateReviewsPage: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<TechnicalProjectSummaryDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [estimates, setEstimates] = useState<DepartmentEstimateDTO[]>([]);
  const [consolidatedEstimate, setConsolidatedEstimate] = useState<ConsolidatedTechnicalEstimateDTO | null>(null);
  const [estimatesLoading, setEstimatesLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Revision State
  const [revisionDeptId, setRevisionDeptId] = useState<string | null>(null);
  const [revisionNotes, setRevisionNotes] = useState('');

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch all projects (for admin review, we typically just need to view them, or we could filter out those that are AWAITING_TECHNICAL_ROUTING)
      const response = await getTechnicalProjects();
      setProjects(response.content.filter(p => p.status !== 'AWAITING_TECHNICAL_ROUTING'));
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProjects();
  }, [fetchProjects]);

  const loadProjectEstimates = async (projectId: string) => {
    setSelectedProjectId(projectId);
    setRevisionDeptId(null);
    setRevisionNotes('');
    try {
      setEstimatesLoading(true);
      setActionError(null);
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
      setActionError(err.response?.data?.message || 'Failed to load estimates.');
    } finally {
      setEstimatesLoading(false);
    }
  };

  const handleRequestRevision = async (deptId: string) => {
    if (!selectedProjectId || !revisionNotes) return;
    try {
      setActionLoading(true);
      setActionError(null);
      await requestRevision(selectedProjectId, deptId, { notes: revisionNotes });
      setRevisionDeptId(null);
      setRevisionNotes('');
      await loadProjectEstimates(selectedProjectId);
    } catch (err: any) {
      console.error(err);
      setActionError(err.response?.data?.message || 'Failed to request revision.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConsolidateAndApprove = async () => {
    if (!selectedProjectId) return;
    if (!window.confirm("Are you sure you want to consolidate and approve these estimates? This will finalize the technical estimate version.")) return;
    try {
      setActionLoading(true);
      setActionError(null);
      await consolidateAndApprove(selectedProjectId);
      await loadProjectEstimates(selectedProjectId);
    } catch (err: any) {
      console.error(err);
      setActionError(err.response?.data?.message || 'Failed to consolidate and approve.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8"><LoadingState message="Loading projects for review..." /></div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Estimate Reviews"
        description="Review submitted department technical estimates, request revisions, and consolidate into final approved estimates."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar - Projects */}
        <Card className="p-4 lg:col-span-1">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900">Active Technical Projects</h3>
          </div>
          {projects.length > 0 ? (
            <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
              {projects.map(project => (
                <button
                  key={project.id} 
                  className={`w-full text-left p-3 border rounded-md cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${selectedProjectId === project.id ? 'border-primary-500 bg-primary-50 shadow-sm ring-1 ring-primary-500' : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'}`}
                  onClick={() => loadProjectEstimates(project.id)}
                  tabIndex={0}
                >
                  <p className="font-medium text-sm text-gray-900">{project.projectCode}</p>
                  <p className="text-xs text-gray-500 mb-2 truncate">{project.projectTitle}</p>
                  <StatusBadge status={project.status} />
                </button>
              ))}
            </div>
          ) : (
             <EmptyState title="No active projects" message="No projects require estimates." />
          )}
        </Card>

        {/* Right Content - Estimates */}
        <div className="lg:col-span-2 space-y-6">
          {!selectedProjectId ? (
            <Card className="p-12 flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <Calculator className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Project</h3>
                <p className="text-gray-500">Choose a project from the left to view submitted estimates.</p>
              </div>
            </Card>
          ) : estimatesLoading ? (
            <Card className="p-12 min-h-[400px]"><LoadingState message="Loading estimates..." /></Card>
          ) : (
            <>
              {actionError && (
                <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200">
                  {actionError}
                </div>
              )}

              {consolidatedEstimate && consolidatedEstimate.status === 'APPROVED' && (
                <Card className="p-6 border-green-500 border-2 bg-green-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-green-900 mb-1">Approved Consolidated Estimate (v{consolidatedEstimate.versionNumber})</h3>
                      <p className="text-sm text-green-700">Approved by {consolidatedEstimate.approvedByName} on {consolidatedEstimate.approvedAt ? format(new Date(consolidatedEstimate.approvedAt), 'MMM d, yyyy') : ''}</p>
                    </div>
                    <StatusBadge status="APPROVED" />
                  </div>
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-4 rounded-md border border-green-200">
                    <div>
                      <p className="text-xs text-gray-500">Subtotal</p>
                      <p className="font-semibold">{formatCurrency(consolidatedEstimate.subtotal)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Contingency</p>
                      <p className="font-semibold">{formatCurrency(consolidatedEstimate.contingencyAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Tax</p>
                      <p className="font-semibold">{formatCurrency(consolidatedEstimate.taxAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Final Total</p>
                      <p className="font-semibold text-primary-700">{formatCurrency(consolidatedEstimate.finalTotal)}</p>
                    </div>
                  </div>
                </Card>
              )}

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Department Estimates</h3>
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
                  <div className="space-y-6">
                    {estimates.map(est => (
                      <div key={est.departmentId} className="border border-gray-200 rounded-md p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-medium text-gray-900">{est.departmentName} (v{est.versionNumber})</h4>
                            <p className="text-xs text-gray-500 mt-1">
                              Submitted by {est.submittedByName} on {est.submittedAt ? format(new Date(est.submittedAt), 'MMM d, yyyy HH:mm') : '-'}
                            </p>
                          </div>
                          <div className="flex flex-col items-end">
                             <StatusBadge status={est.status} />
                             {est.status === 'SUBMITTED' && (!consolidatedEstimate || consolidatedEstimate.status !== 'APPROVED') && (
                               <Button 
                                 className="mt-2 text-red-600 bg-red-50 hover:bg-red-100 border border-red-200" 
                                 onClick={() => setRevisionDeptId(est.departmentId)}
                               >
                                 Request Revision
                               </Button>
                             )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 bg-gray-50 p-3 rounded-md mb-4 text-sm border border-gray-100">
                           <div><span className="block text-xs text-gray-500">Subtotal</span><span className="font-medium">{formatCurrency(est.subtotal)}</span></div>
                           <div><span className="block text-xs text-gray-500">Contingency</span><span className="font-medium">{formatPercentage(est.contingencyPercentage)} ({formatCurrency(est.contingencyAmount)})</span></div>
                           <div><span className="block text-xs text-gray-500">Tax</span><span className="font-medium">{formatPercentage(est.taxPercentage)} ({formatCurrency(est.taxAmount)})</span></div>
                           <div><span className="block text-xs text-gray-500">Margin</span><span className="font-medium">{formatPercentage(est.marginPercentage)} ({formatCurrency(est.marginAmount)})</span></div>
                           <div><span className="block text-xs text-gray-500">Final Total</span><span className="font-medium text-primary-700">{formatCurrency(est.finalTotal)}</span></div>
                        </div>

                        <div className="mb-4">
                           <span className="block text-xs text-gray-500 mb-1">Timeline</span>
                           <span className="font-medium text-sm">
                             {formatDays((est.designDurationDays || 0) + (est.developmentDurationDays || 0) + (est.testingDurationDays || 0) + (est.procurementDurationDays || 0) + (est.installationDurationDays || 0) + (est.trainingDurationDays || 0) + (est.deliveryDurationDays || 0))} Days Total
                           </span>
                        </div>

                        <div className="mb-4">
                           <span className="block text-xs text-gray-500 mb-2">Line Items</span>
                           {est.lineItems && est.lineItems.length > 0 ? (
                             <div className="border border-gray-200 rounded-md overflow-hidden">
                               <Table>
                                 <TableHead>
                                   <TableRow>
                                     <TableHeader>Category</TableHeader>
                                     <TableHeader>Description</TableHeader>
                                     <TableHeader>Qty</TableHeader>
                                     <TableHeader>Unit Cost</TableHeader>
                                     <TableHeader className="text-right">Total</TableHeader>
                                   </TableRow>
                                 </TableHead>
                                 <TableBody>
                                   {(est.lineItems || []).map((item, idx) => (
                                     <TableRow key={item.id || idx}>
                                       <TableCell className="text-xs">{item.category}</TableCell>
                                       <TableCell className="text-xs">{item.description}</TableCell>
                                       <TableCell className="text-xs">{item.quantity} {item.unitOfMeasure}</TableCell>
                                       <TableCell className="text-xs">{formatCurrency(item.unitCost)}</TableCell>
                                       <TableCell className="text-xs text-right">{formatCurrency(item.totalCost)}</TableCell>
                                     </TableRow>
                                   ))}
                                 </TableBody>
                               </Table>
                             </div>
                           ) : (
                             <p className="text-sm text-gray-500 italic">No line items.</p>
                           )}
                        </div>

                        {revisionDeptId === est.departmentId && (
                          <div className="mt-4 p-4 border border-red-200 bg-red-50 rounded-md">
                            <h5 className="text-sm font-medium text-red-800 mb-2">Request Revision</h5>
                            <Textarea 
                              value={revisionNotes}
                              onChange={(e: any) => setRevisionNotes(e.target.value)}
                              placeholder="Explain what needs to be changed..."
                              rows={3}
                            />
                            <div className="mt-3 flex space-x-2">
                              <Button 
                                className="text-red-600 bg-red-50 hover:bg-red-100 border border-red-200" 
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
                        
                        <div className="mt-2 flex justify-end">
                           <Button 
                             variant="secondary" 
                             onClick={() => navigate(`/hod/estimates/${selectedProjectId}/department/${est.departmentId}`)}
                           >
                             <Search className="w-4 h-4 mr-2 inline-block" />
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};
