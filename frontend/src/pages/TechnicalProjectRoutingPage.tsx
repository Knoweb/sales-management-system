import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import { 
  getTechnicalProject, 
  routeProject, 
  reviseRouting,
  type TechnicalProjectDetailDTO,
  type ProjectRoutingRequest,
  type RoutingRevisionRequest
} from '../services/TechnicalProjectApi';
import { DepartmentApi } from '../services/DepartmentApi';
import type { Department } from '../types/department';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { ErrorState, LoadingState } from '../components/FeedbackStates';
import { Button } from '../components/Button';
import { IconButton } from '../components/IconButton';
import { Input, Textarea } from '../components/Forms';
import { Alert } from '../components/Alert';
import { Waypoints, ArrowLeft } from 'lucide-react';

interface DeptRoutingConfig {
  departmentId: string;
  requiredScope: string;
  expectedEstimateSubmissionDate: string;
  routingNotes: string;
}

export const TechnicalProjectRoutingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<TechnicalProjectDetailDTO | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [selectedDeptIds, setSelectedDeptIds] = useState<string[]>([]);
  const [deptConfigs, setDeptConfigs] = useState<Record<string, DeptRoutingConfig>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [revisionReason, setRevisionReason] = useState('');

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const [projData, deptsData] = await Promise.all([
        getTechnicalProject(id),
        DepartmentApi.search(undefined, true, 0, 1000).then(res => res.content)
      ]);
      setProject(projData);
      setDepartments(deptsData);
      
      if (projData.routedDepartments && projData.routedDepartments.length > 0) {
        const initialConfigs: Record<string, DeptRoutingConfig> = {};
        projData.routedDepartments.forEach(d => {
          initialConfigs[d.departmentId] = {
            departmentId: d.departmentId,
            requiredScope: (projData.projectBrief?.projectScope || projData.projectBrief?.projectDescription || '').trim() || 'Technical scope assessment required',
            expectedEstimateSubmissionDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
            routingNotes: d.routingReason || ''
          };
        });
        setDeptConfigs(initialConfigs);
        setSelectedDeptIds(projData.routedDepartments.map(d => d.departmentId));
      }
    } catch (err: unknown) {
      console.error(err);
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Failed to load project details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  const toggleDepartment = (deptId: string) => {
    setSelectedDeptIds(prev => {
      const isSelected = prev.includes(deptId);
      if (isSelected) {
        return prev.filter(id => id !== deptId);
      } else {
        if (!deptConfigs[deptId]) {
          setDeptConfigs(old => ({
            ...old,
            [deptId]: {
              departmentId: deptId,
              requiredScope: (project?.projectBrief?.projectScope || project?.projectBrief?.projectDescription || '').trim() || 'Technical scope assessment required',
              expectedEstimateSubmissionDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
              routingNotes: ''
            }
          }));
        }
        return [...prev, deptId];
      }
    });
  };

  const updateDeptConfig = (deptId: string, field: keyof DeptRoutingConfig, value: string) => {
    setDeptConfigs(prev => ({
      ...prev,
      [deptId]: {
        ...prev[deptId],
        [field]: value
      }
    }));
    setFieldErrors(prev => {
      const copy = { ...prev };
      delete copy[`${deptId}_${field}`];
      return copy;
    });
  };

  const isDeptConfigValid = (deptId: string): boolean => {
    const config = deptConfigs[deptId];
    if (!config) return false;
    if (!config.requiredScope || !config.requiredScope.trim()) return false;
    if (!config.expectedEstimateSubmissionDate || !config.expectedEstimateSubmissionDate.trim()) return false;
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    if (config.expectedEstimateSubmissionDate < todayStr) return false;
    return true;
  };

  const isPending = project?.status === 'AWAITING_TECHNICAL_ROUTING';
  const isRevision = project?.status === 'ROUTED' || project?.status === 'TEAM_FORMATION_IN_PROGRESS';
  const canRoute = isPending || isRevision;
  const isRouted = !canRoute;

  const isAllValid = selectedDeptIds.length > 0 &&
    selectedDeptIds.every(id => isDeptConfigValid(id)) &&
    (!isRevision || revisionReason.trim().length > 0);

  const parseBackendValidationErrors = (errorText: string) => {
    if (errorText.startsWith('Validation failed for request data:')) {
      const details = errorText.replace('Validation failed for request data:', '').trim();
      const parsedErrors: Record<string, string> = {};
      const regex = /departments\[(\d+)\]\.([a-zA-Z0-9_]+):\s*([^,]+?)(?=(,\s*(?:departments\[|[a-zA-Z0-9_]+:)|$))/g;
      const matches = details.matchAll(regex);
      for (const match of matches) {
        const index = parseInt(match[1], 10);
        const field = match[2];
        const msg = match[3].trim();
        const deptId = selectedDeptIds[index];
        if (deptId) {
          parsedErrors[`${deptId}_${field}`] = msg;
        }
      }
      const topRegex = /(revisionReason):\s*([^,]+?)(?=(,\s*(?:departments\[|[a-zA-Z0-9_]+:)|$))/g;
      const topMatches = details.matchAll(topRegex);
      for (const match of topMatches) {
        parsedErrors[match[1]] = match[2].trim();
      }
      setFieldErrors(parsedErrors);
    }
  };

  const handleRoute = async () => {
    if (!id || selectedDeptIds.length === 0 || !isAllValid) return;
    try {
      setSubmitting(true);
      setError(null);
      setFieldErrors({});
      const payload: ProjectRoutingRequest = {
        departments: selectedDeptIds.map(deptId => {
          const cfg = deptConfigs[deptId];
          return {
            departmentId: deptId,
            requiredScope: cfg?.requiredScope?.trim() || '',
            expectedEstimateSubmissionDate: cfg?.expectedEstimateSubmissionDate || format(addDays(new Date(), 7), 'yyyy-MM-dd'),
            ...(cfg?.routingNotes?.trim() ? { routingNotes: cfg.routingNotes.trim() } : {})
          };
        })
      };
      await routeProject(id, payload);
      navigate('/technical-projects');
    } catch (err: unknown) {
      console.error(err);
      const e = err as { response?: { data?: { message?: string } } };
      const errorText = e.response?.data?.message || 'Failed to route project.';
      setError(errorText);
      parseBackendValidationErrors(errorText);
      setSubmitting(false);
    }
  };

  const handleRevise = async () => {
    if (!id || selectedDeptIds.length === 0 || !isAllValid || !revisionReason.trim()) return;
    try {
      setSubmitting(true);
      setError(null);
      setFieldErrors({});
      const payload: RoutingRevisionRequest = {
        departments: selectedDeptIds.map(deptId => {
          const cfg = deptConfigs[deptId];
          return {
            departmentId: deptId,
            requiredScope: cfg?.requiredScope?.trim() || '',
            expectedEstimateSubmissionDate: cfg?.expectedEstimateSubmissionDate || format(addDays(new Date(), 7), 'yyyy-MM-dd'),
            ...(cfg?.routingNotes?.trim() ? { routingNotes: cfg.routingNotes.trim() } : {})
          };
        }),
        revisionReason: revisionReason.trim(),
        optimisticLockVersion: project?.version ?? 0
      };
      await reviseRouting(id, payload);
      navigate('/technical-projects');
    } catch (err: unknown) {
      console.error(err);
      const e = err as { response?: { data?: { message?: string } } };
      const errorText = e.response?.data?.message || 'Failed to revise routing.';
      setError(errorText);
      parseBackendValidationErrors(errorText);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <LoadingState message="Loading project details..." />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-8">
        <ErrorState
          title="Failed to load project"
          message={error || 'Project not found'}
          onRetry={fetchData}
        />
        <div className="mt-4 flex justify-center">
          <Button variant="secondary" onClick={() => navigate('/technical-projects')} icon={<ArrowLeft className="w-4 h-4" />}>
            Back to Queue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center space-x-4">
        <IconButton icon={<ArrowLeft className="w-5 h-5" />} onClick={() => navigate('/technical-projects')} aria-label="Back" />
        <PageHeader
          title={`Route Project: ${project.projectBrief?.projectName || 'Unknown'}`}
          description="Select technical departments and route this project."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 space-y-6"><div className="mb-4"><h3 className="text-lg font-medium text-gray-900">Project Details</h3></div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{project.projectBrief?.projectName}</h3>
                <p className="text-sm text-gray-500 mt-1">Status: <StatusBadge status={project.status} /></p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="block text-gray-500 mb-1">Expected Start Date</span>
                <span className="font-medium">
                  {project.projectBrief?.expectedStartDate ? format(new Date(project.projectBrief.expectedStartDate), 'MMM d, yyyy') : '-'}
                </span>
              </div>
              <div>
                <span className="block text-gray-500 mb-1">Expected Delivery Date</span>
                <span className="font-medium">
                  {project.projectBrief?.expectedDeliveryDate ? format(new Date(project.projectBrief.expectedDeliveryDate), 'MMM d, yyyy') : '-'}
                </span>
              </div>
            </div>

            <div>
              <span className="block text-gray-500 mb-1 text-sm">Description</span>
              <p className="text-gray-900 whitespace-pre-wrap text-sm">{project.projectBrief?.projectDescription || '-'}</p>
            </div>
            
            <div>
              <span className="block text-gray-500 mb-1 text-sm">Scope</span>
              <p className="text-gray-900 whitespace-pre-wrap text-sm">{project.projectBrief?.projectScope || '-'}</p>
            </div>
          </Card>

          {isRouted && (
            <Card className="p-6"><div className="mb-4"><h3 className="text-lg font-medium text-gray-900">Routed Departments</h3></div>
              <div className="space-y-4">
                {project.routedDepartments.map((d) => (
                  <div key={d.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <h4 className="font-medium text-gray-900">{d.departmentName || d.departmentId}</h4>
                      <p className="text-sm text-gray-500">Assigned: {format(new Date(d.assignedAt), 'MMM d, yyyy HH:mm')}</p>
                    </div>
                    <StatusBadge status={d.status} />
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {canRoute && (
            <Card className="p-6"><div className="mb-4"><h3 className="text-lg font-medium text-gray-900">Routing Configuration</h3></div>
              <div className="space-y-6">
                {error && (
                  <Alert variant="error" title="Validation / Routing Error">
                    {error}
                  </Alert>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Departments *</label>
                  <div className="space-y-2 max-h-60 overflow-y-auto p-2 border border-gray-200 rounded-md">
                    {departments.map(dept => (
                      <label key={dept.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedDeptIds.includes(dept.id)}
                          onChange={() => toggleDepartment(dept.id)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-900 font-medium">{dept.name}</span>
                      </label>
                    ))}
                  </div>
                  {selectedDeptIds.length === 0 && (
                    <p className="text-sm text-red-600 mt-1">Please select at least one department.</p>
                  )}
                </div>

                {selectedDeptIds.length > 0 && (
                  <div className="space-y-4 border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-semibold text-gray-900">Department Routing Details</h4>
                    {selectedDeptIds.map(deptId => {
                      const dept = departments.find(d => d.id === deptId);
                      const config = deptConfigs[deptId] || {
                        departmentId: deptId,
                        requiredScope: (project?.projectBrief?.projectScope || project?.projectBrief?.projectDescription || '').trim() || 'Technical scope assessment required',
                        expectedEstimateSubmissionDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
                        routingNotes: ''
                      };
                      return (
                        <div key={deptId} className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-4">
                          <h5 className="font-medium text-gray-900">{dept?.name || deptId}</h5>
                          <Textarea
                            label="Required Scope *"
                            value={config.requiredScope}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateDeptConfig(deptId, 'requiredScope', e.target.value)}
                            placeholder="Specify technical scope required..."
                            required
                            rows={3}
                            error={fieldErrors[`${deptId}_requiredScope`]}
                          />
                          <Input
                            type="date"
                            label="Expected Estimate Submission Date *"
                            value={config.expectedEstimateSubmissionDate}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateDeptConfig(deptId, 'expectedEstimateSubmissionDate', e.target.value)}
                            required
                            min={format(new Date(), 'yyyy-MM-dd')}
                            error={fieldErrors[`${deptId}_expectedEstimateSubmissionDate`]}
                          />
                          <Textarea
                            label="Routing Notes (Optional)"
                            value={config.routingNotes}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateDeptConfig(deptId, 'routingNotes', e.target.value)}
                            placeholder="Optional notes or instructions for this department..."
                            rows={2}
                            error={fieldErrors[`${deptId}_routingNotes`]}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

                {isRevision && (
                  <Textarea
                    label="Revision Reason *"
                    value={revisionReason}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRevisionReason(e.target.value)}
                    placeholder="Why are you revising the routing?"
                    required
                    rows={3}
                    error={fieldErrors['revisionReason']}
                  />
                )}

                <Button
                  className="w-full"
                  onClick={isRevision ? handleRevise : handleRoute}
                  disabled={submitting || !isAllValid}
                  isLoading={submitting}
                  icon={<Waypoints className="w-4 h-4" />}
                >
                  {isRevision ? 'Revise Routing' : 'Route Project'}
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
