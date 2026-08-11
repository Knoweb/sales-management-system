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
} from '../../services/TechnicalProjectApi';
import { DepartmentApi } from '../../services/DepartmentApi';
import type { Department } from '../../types/department';
import { Card } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { ErrorState, LoadingState } from '../../components/FeedbackStates';
import { Button } from '../../components/Button';
import { Input, Textarea } from '../../components/Forms';
import { Alert } from '../../components/Alert';
import { Waypoints, ArrowLeft, AlertCircle, Check } from 'lucide-react';
import './TechnicalProjectRoutingPage.css';
interface DeptRoutingConfig {
  departmentId: string;
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
            requiredScope: project?.projectScope || 'Refer to Project Scope',
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
            requiredScope: project?.projectScope || 'Refer to Project Scope',
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
    <div className="max-w-5xl mx-auto pb-12">
      <div>
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate('/technical-projects')}
          style={{
            height: '40px',
            paddingInline: '12px',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text-secondary)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            boxShadow: 'none',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <ArrowLeft size={18} strokeWidth={2.2} />
            Back to Technical Projects
          </span>
        </Button>
      </div>

      <div style={{ marginTop: '24px', marginBottom: '24px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px',
            width: '100%',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '16px',
            padding: '24px 28px',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.06)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              minWidth: 0,
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '16px',
                backgroundColor: 'var(--color-primary-soft)',
                color: 'var(--color-primary)',
              }}
            >
              <Waypoints size={28} />
            </div>

            <div style={{ minWidth: 0 }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: '24px',
                  lineHeight: '1.25',
                  fontWeight: 700,
                  color: 'var(--color-text-primary)',
                }}
              >
                {project.projectTitle || 'Technical Project'}
              </h1>

              <p
                style={{
                  margin: '6px 0 0',
                  fontSize: '15px',
                  color: 'var(--color-text-muted)',
                }}
              >
                Client: {project.clientName || 'Not provided'}
                {project.opportunityReference
                  ? ` • Opportunity: ${project.opportunityReference}`
                  : ''}
              </p>
            </div>
          </div>

          <div style={{ flexShrink: 0 }}>
            <StatusBadge status={project.status} />
          </div>
        </div>
      </div>

      <div className="technical-page-sections">
        <Card className="technical-section-card">
          <div className="technical-section-header">
            <h2>Project Details</h2>
          </div>

          <div className="technical-details-grid">
            <div className="technical-detail-field">
              <label>Client</label>
              <div className="technical-detail-value">
                {project.clientName || 'Not provided'}
              </div>
            </div>

            <div className="technical-detail-field">
              <label>Opportunity</label>
              <div className="technical-detail-value">
                {project.opportunityTitle || project.opportunityReference || 'Not provided'}
              </div>
            </div>

            <div className="technical-detail-field">
              <label>Expected Budget</label>
              <div className="technical-detail-value">
                {project.expectedBudget
                  ? `LKR ${project.expectedBudget.toLocaleString()}`
                  : 'Not provided'}
              </div>
            </div>

            <div className="technical-detail-field">
              <label>Expected Deadline</label>
              <div className="technical-detail-value">
                {project.expectedDeadline
                  ? format(new Date(project.expectedDeadline), 'MMM d, yyyy')
                  : 'Not provided'}
              </div>
            </div>

            <div className="technical-detail-field">
              <label>Project Brief Version</label>
              <div className="technical-detail-value">
                {project.currentVersionNumber
                  ? `Version ${project.currentVersionNumber}`
                  : 'Not provided'}
              </div>
            </div>

            <div className="technical-detail-field">
              <label>Status</label>
              <div className="technical-detail-value technical-status-field">
                <StatusBadge status={project.status} />
              </div>
            </div>
          </div>
        </Card>

        <Card className="technical-section-card">
          <div className="technical-section-header">
            <h2>Project Requirements</h2>
          </div>

          <div className="technical-requirements">
            <div className="technical-requirement-field">
              <label>Project Scope</label>
              <div className="technical-requirement-value">
                {project.projectScope || 'Not provided'}
              </div>
            </div>

            <div className="technical-requirement-field">
              <label>Technical Requirements</label>
              <div className="technical-requirement-value">
                {project.technicalRequirements || 'Not provided'}
              </div>
            </div>

            <div className="technical-requirement-field">
              <label>Required Departments</label>
              <div className="technical-department-chips">
                {project.suggestedDepartmentIds && project.suggestedDepartmentIds.length > 0 ? (
                  project.suggestedDepartmentIds.map(deptId => {
                    const dept = departments.find(d => d.id === deptId);
                    return (
                      <span key={deptId} className="technical-department-chip">
                        {dept?.name || deptId}
                      </span>
                    );
                  })
                ) : project.suggestedDepartments ? (
                  project.suggestedDepartments.split(',').map((deptName, i) => (
                    <span key={i} className="technical-department-chip">
                      {deptName.trim()}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-500">None specified</span>
                )}
              </div>
            </div>
          </div>
        </Card>

        {isRouted && (
          <Card className="technical-section-card">
            <div className="technical-section-header">
              <h2>Routed Departments</h2>
            </div>
            <div className="technical-routing-content">
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
            </div>
          </Card>
        )}

        {canRoute && (
          <Card className="technical-section-card">
            <div className="technical-section-header">
              <h2>Routing Configuration</h2>
            </div>

            <div className="technical-routing-content">
              {error && (
                <Alert variant="error" title="Validation / Routing Error">
                  {error}
                </Alert>
              )}

              <label className="technical-routing-label">
                Select Departments <span>*</span>
              </label>

              <div className="technical-department-grid">
                {departments.map(dept => {
                  const isSelected = selectedDeptIds.includes(dept.id);
                  return (
                    <button
                      type="button"
                      key={dept.id}
                      onClick={() => toggleDepartment(dept.id)}
                      className={
                        isSelected
                          ? 'technical-department-option selected'
                          : 'technical-department-option'
                      }
                    >
                      <span className="technical-checkbox">
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                      </span>
                      <span>{dept.name}</span>
                    </button>
                  );
                })}
              </div>

              {selectedDeptIds.length === 0 && (
                <div className="technical-routing-error">
                  <AlertCircle className="w-4 h-4" />
                  <span>Please select at least one department.</span>
                </div>
              )}

              {selectedDeptIds.length > 0 && (
                <div className="technical-routing-details">
                  <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-3">Department Routing Details</h3>
                  <div>
                    {selectedDeptIds.map(deptId => {
                      const dept = departments.find(d => d.id === deptId);
                      const config = deptConfigs[deptId] || {
                        departmentId: deptId,
                        expectedEstimateSubmissionDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
                        routingNotes: ''
                      };
                      return (
                        <div key={deptId} className="technical-department-routing-card space-y-5">
                          <h5 className="text-base font-semibold text-slate-900">{dept?.name || deptId}</h5>
                          
                          <Input
                            type="date"
                            label="Expected Estimate Submission Date"
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
                            placeholder="Optional notes..."
                            rows={2}
                            error={fieldErrors[`${deptId}_routingNotes`]}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {isRevision && (
                <div className="mt-6 pt-4 border-t border-slate-200">
                  <Textarea
                    label="Revision Reason *"
                    value={revisionReason}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRevisionReason(e.target.value)}
                    placeholder="Why are you revising the routing?"
                    required
                    rows={3}
                    error={fieldErrors['revisionReason']}
                  />
                </div>
              )}

              <div className="technical-routing-actions">
                <Button
                  onClick={isRevision ? handleRevise : handleRoute}
                  disabled={submitting || !isAllValid}
                  isLoading={submitting}
                  icon={<Waypoints className="w-4 h-4" />}
                >
                  {isRevision ? 'Revise Routing' : 'Route Project'}
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

