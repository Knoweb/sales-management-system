import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getProjectBrief,
  updateProjectBriefDraft,
  submitProjectBrief,
  getProjectBriefVersions,
  getProjectBriefAttachments,
  uploadProjectBriefAttachment,
  deleteProjectBriefAttachment,
  type ProjectBriefDTO,
  type ProjectBriefVersionDTO,
  type ProjectBriefAttachmentDTO
} from '../api/projectBriefApi';
import { getOpportunity } from '../api/opportunityApi';
import { DepartmentApi } from '../services/DepartmentApi';
import type { Department } from '../types/department';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Input, Textarea, Checkbox } from '../components/Forms';
import { Button } from '../components/Button';
import { ErrorState, LoadingState, EmptyState } from '../components/FeedbackStates';
import { StatusBadge, getStatusVariant } from '../components/StatusBadge';
import { Tabs, type TabItem } from '../components/Tabs';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../components/Table';
import { FileText, Send, History, Paperclip, Upload, Trash2, Download, AlertTriangle, ArrowLeft } from 'lucide-react';

const ProjectBriefEditor: React.FC = () => {
  const { id, opportunityId } = useParams<{ id?: string, opportunityId?: string }>();
  const navigate = useNavigate();
  const [brief, setBrief] = useState<ProjectBriefDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('edit');

  const [allDepartments, setAllDepartments] = useState<Department[]>([]);
  const [versions, setVersions] = useState<ProjectBriefVersionDTO[]>([]);
  const [attachments, setAttachments] = useState<ProjectBriefAttachmentDTO[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    projectTitle: '',
    businessProblem: '',
    requiredSolution: '',
    projectScope: '',
    technicalRequirements: '',
    expectedBudget: 0,
    currency: 'LKR',
    expectedDeadline: '',
    requiredDepartmentIds: [] as string[]
  });

  const loadBrief = useCallback(async (briefIdToLoad?: string, oppIdToLoad?: string) => {
    try {
      setLoading(true);
      setError(null);
      setConflictError(null);
      let data: ProjectBriefDTO;
      if (briefIdToLoad) {
        data = await getProjectBrief(briefIdToLoad);
      } else if (oppIdToLoad) {
        const opp = await getOpportunity(oppIdToLoad);
        if (!opp.projectBrief?.id) {
          setError('Project Brief not found for this opportunity');
          setLoading(false);
          return;
        }
        data = await getProjectBrief(opp.projectBrief.id);
      } else {
        return;
      }
      setBrief(data);
      setFormData({
        projectTitle: data.projectTitle || '',
        businessProblem: data.businessProblem || '',
        requiredSolution: data.requiredSolution || '',
        projectScope: data.projectScope || '',
        technicalRequirements: data.technicalRequirements || '',
        expectedBudget: data.expectedBudget || 0,
        currency: data.currency || 'LKR',
        expectedDeadline: data.expectedDeadline ? data.expectedDeadline.substring(0, 10) : '',
        requiredDepartmentIds: data.requiredDepartments ? data.requiredDepartments.map(d => d.id) : []
      });

      // Load auxiliary data asynchronously
      DepartmentApi.search().then(res => setAllDepartments(res.content || [])).catch(() => { });
      getProjectBriefVersions(data.id).then(setVersions).catch(() => { });
      getProjectBriefAttachments(data.id).then(setAttachments).catch(() => { });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Failed to load project brief');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id || opportunityId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadBrief(id, opportunityId);
    }
  }, [id, opportunityId, loadBrief]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'expectedBudget' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleDepartmentToggle = (deptId: string) => {
    setFormData(prev => {
      const exists = prev.requiredDepartmentIds.includes(deptId);
      return {
        ...prev,
        requiredDepartmentIds: exists
          ? prev.requiredDepartmentIds.filter(i => i !== deptId)
          : [...prev.requiredDepartmentIds, deptId]
      };
    });
  };


  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.projectTitle) errors.projectTitle = 'Project Title is required';
    if (!formData.expectedDeadline) errors.expectedDeadline = 'Expected Deadline is required';
    if (!formData.businessProblem) errors.businessProblem = 'Business Problem is required';
    if (!formData.requiredSolution) errors.requiredSolution = 'Required Solution is required';
    if (!formData.projectScope) errors.projectScope = 'Project Scope is required';
    if (!formData.technicalRequirements) errors.technicalRequirements = 'Technical Requirements is required';
    if (formData.expectedBudget <= 0) errors.expectedBudget = 'Expected Budget must be greater than 0';
    if (!formData.currency) errors.currency = 'Currency is required';
    if (formData.requiredDepartmentIds.length === 0) errors.requiredDepartmentIds = 'At least one department is required';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!brief?.id) return;
    const currentId = brief.id;

    if (!validateForm()) {
      setError('Please fill in all required fields before submitting.');
      return;
    }

    if (!window.confirm('Are you sure you want to submit this Project Brief? Submitted briefs become read-only.')) {
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      setConflictError(null);
      setSuccessMessage(null);

      // Save draft first
      await updateProjectBriefDraft(currentId, {
        ...formData,
        expectedDeadline: formData.expectedDeadline ? new Date(formData.expectedDeadline).toISOString() : undefined,
      });

      // Submit
      await submitProjectBrief(currentId, { confirmation: true });
      navigate(`/opportunities/${brief.opportunityId}`);
    } catch (err: unknown) {
      const e = err as { response?: { status?: number, data?: { message?: string } } };
      if (e.response?.status === 409) {
        setConflictError(e.response?.data?.message ?? 'This action is not allowed in the current workflow state.');
      } else {
        setError(e.response?.data?.message || 'Failed to submit brief');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!brief?.id || !file) return;
    const currentId = brief.id;
    try {
      setUploading(true);
      setError(null);
      await uploadProjectBriefAttachment(currentId, file);
      if (fileInputRef.current) fileInputRef.current.value = '';
      const atts = await getProjectBriefAttachments(currentId);
      setAttachments(atts);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Failed to upload attachment');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAttachment = async (attId: string) => {
    if (!brief?.id || !window.confirm('Are you sure you want to delete this attachment?')) return;
    const currentId = brief.id;
    try {
      await deleteProjectBriefAttachment(currentId, attId);
      setAttachments(prev => prev.filter(a => a.id !== attId));
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Failed to delete attachment');
    }
  };

  if (loading) return <div className="p-6 max-w-7xl mx-auto"><LoadingState message="Loading project brief..." /></div>;
  if (error && !brief) return <div className="p-6 max-w-7xl mx-auto"><ErrorState message={error} onRetry={() => (id || opportunityId) && loadBrief(id, opportunityId)} /></div>;
  if (!brief) return <div className="p-6 max-w-7xl mx-auto"><ErrorState message="Brief not found" /></div>;

  const isEditableStatus = ['DRAFT', 'BDM_RETURNED_FOR_REVISION', 'BDM_INFORMATION_REQUESTED', 'CLIENT_CHANGES_REQUESTED'].includes(brief.status);
  const isReadOnly = !isEditableStatus;

  const tabs: TabItem[] = [
    { id: 'edit', label: 'Brief Details', icon: <FileText size={18} /> },
    { id: 'versions', label: `Versions (${versions.length})`, icon: <History size={18} /> },
    { id: 'attachments', label: `Attachments (${attachments.length})`, icon: <Paperclip size={18} /> }
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto w-full space-y-6">
      <div style={{ marginBottom: '20px' }}>
        <button
          type="button"
          onClick={() => opportunityId ? navigate(`/opportunities/${opportunityId}`) : navigate(-1)}
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
          <ArrowLeft size={18} strokeWidth={2.2} />
          Back to Opportunity
        </button>
      </div>

      <PageHeader
        title={`Project Brief: ${brief.projectTitle || 'Untitled'}`}
        icon={<FileText size={24} />}
        description={`Version: v${brief.currentVersionNumber}`}
        actionElement={
          <div className="ml-4 flex gap-3 items-center">
            <StatusBadge status={brief.status} variant={getStatusVariant(brief.status)} />
          </div>
        }
      />

      {conflictError && (
        <div className="p-4 bg-danger-bg text-danger border border-danger-border rounded-md flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle />
            <span>{conflictError}</span>
          </div>
          <Button variant="outline" onClick={() => (id || opportunityId) && loadBrief(id, opportunityId)}>Reload Latest</Button>
        </div>
      )}

      {error && <ErrorState message={error} />}

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div className="mt-6">
        {activeTab === 'edit' && (
          <>
            <Card>
              <div className="flex flex-col gap-10 p-2">

                {/* Project Information */}
                <section>
                  <div style={{ marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--color-border)' }}>
                    <h3 style={{ margin: 0, color: 'var(--color-text-primary)', fontSize: '18px', fontWeight: 600 }}>Project Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', columnGap: '1.5rem', rowGap: '1rem' }}>
                    <Input
                      label="Project Title"
                      type="text"
                      name="projectTitle"
                      value={formData.projectTitle}
                      onChange={handleChange}
                      disabled={isReadOnly}
                      error={validationErrors.projectTitle}
                      required
                    />
                    <Input
                      label="Expected Deadline"
                      type="date"
                      name="expectedDeadline"
                      value={formData.expectedDeadline}
                      onChange={handleChange}
                      disabled={isReadOnly}
                      error={validationErrors.expectedDeadline}
                      required
                    />
                    <Input
                      label="Expected Budget"
                      type="number"
                      name="expectedBudget"
                      value={formData.expectedBudget}
                      onChange={handleChange}
                      disabled={isReadOnly}
                      error={validationErrors.expectedBudget}
                      required
                      min="0"
                    />
                    <Input
                      label="Currency"
                      type="text"
                      name="currency"
                      value={formData.currency}
                      onChange={handleChange}
                      disabled={isReadOnly}
                      error={validationErrors.currency}
                      required
                    />
                  </div>
                </section>

                {/* Requirements */}
                <section>
                  <div style={{ marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--color-border)' }}>
                    <h3 style={{ margin: 0, color: 'var(--color-text-primary)', fontSize: '18px', fontWeight: 600 }}>Requirements</h3>
                  </div>
                  <div className="flex flex-col gap-6">
                    <Textarea
                      label="Business Problem"
                      name="businessProblem"
                      value={formData.businessProblem}
                      onChange={handleChange}
                      disabled={isReadOnly}
                      error={validationErrors.businessProblem}
                      rows={4}
                      placeholder="Describe the business problem..."
                      required
                      style={{ minHeight: '120px' }}
                    />
                    <Textarea
                      label="Required Solution"
                      name="requiredSolution"
                      value={formData.requiredSolution}
                      onChange={handleChange}
                      disabled={isReadOnly}
                      error={validationErrors.requiredSolution}
                      rows={4}
                      placeholder="Describe the required solution..."
                      required
                      style={{ minHeight: '120px' }}
                    />
                    <Textarea
                      label="Project Scope"
                      name="projectScope"
                      value={formData.projectScope}
                      onChange={handleChange}
                      disabled={isReadOnly}
                      error={validationErrors.projectScope}
                      rows={4}
                      placeholder="Detail the scope of work..."
                      required
                      style={{ minHeight: '120px' }}
                    />
                    <Textarea
                      label="Technical Requirements"
                      name="technicalRequirements"
                      value={formData.technicalRequirements}
                      onChange={handleChange}
                      disabled={isReadOnly}
                      error={validationErrors.technicalRequirements}
                      rows={4}
                      placeholder="List technical constraints and stack..."
                      required
                      style={{ minHeight: '120px' }}
                    />
                    <div>
                      <label className="form-label mb-2 block">Required Departments <span className="form-required">*</span></label>
                      <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-4 border rounded-md ${validationErrors.requiredDepartmentIds ? 'border-danger bg-danger-bg' : 'border-border bg-surface-secondary'}`}>
                        {allDepartments.map(dept => {
                          const checked = formData.requiredDepartmentIds.includes(dept.id);
                          return (
                            <Checkbox
                              key={dept.id}
                              label={dept.name}
                              checked={checked}
                              onChange={() => !isReadOnly && handleDepartmentToggle(dept.id)}
                              disabled={isReadOnly}
                            />
                          );
                        })}
                      </div>
                      {validationErrors.requiredDepartmentIds && (
                        <p className="form-error mt-2">
                          <AlertTriangle size={12} className="inline mr-1" />
                          {validationErrors.requiredDepartmentIds}
                        </p>
                      )}
                    </div>
                  </div>
                </section>



              </div>

              {/* Actions Footer */}
              {!isReadOnly && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    marginTop: '2rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid var(--color-border)',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <StatusBadge
                      status={`Status: ${brief.status}`}
                      variant={(() => {
                        const s = brief.status.toUpperCase().replace(/\s+/g, '_');
                        if (['SUBMITTED', 'PENDING', 'RETURNED_FOR_REVISION'].includes(s)) return 'warning';
                        if (['APPROVED'].includes(s)) return 'success';
                        if (['REJECTED'].includes(s)) return 'error';
                        return 'neutral';
                      })()}
                    />
                    <span className="badge badge-neutral">
                      Version: v{brief.currentVersionNumber}
                    </span>
                    {successMessage && <span className="text-success text-xs font-medium ml-2">{successMessage}</span>}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.875rem 1rem',
                        backgroundColor: 'var(--color-warning-bg)',
                        border: '1px solid #fbbf24',
                        borderRadius: '0.75rem',
                        color: 'var(--color-warning)',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                        marginRight: '0.5rem',
                        fontSize: '14px',
                        fontWeight: 500,
                      }}
                      className="hidden md:flex"
                    >
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '9999px',
                          backgroundColor: 'var(--color-warning-bg)',
                          color: 'var(--color-warning)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <AlertTriangle size={18} />
                      </div>
                      Make sure all required attachments are uploaded before submitting.
                    </div>
                    <Button variant="secondary" onClick={() => navigate(-1)} disabled={submitting}>
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleSubmit}
                      isLoading={submitting}
                      disabled={submitting}
                      icon={<Send size={18} />}
                    >
                      {submitting ? 'Submitting...' : 'Submit Brief'}
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </>
        )}

        {activeTab === 'versions' && (
          <Card>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                marginBottom: "0.7rem",
              }}
            >
              <h3 className="text-lg font-medium text-gray-900" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <History size={18} className="text-primary" />
                Version History
              </h3>
            </div>

            <div className="card-body">
              {versions.length === 0 ? (
                <EmptyState
                  title="No versions saved"
                  message="This project brief has no version history yet."
                />
              ) : (
                <div className="table-container">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableHeader>Version</TableHeader>
                        <TableHeader>Type</TableHeader>
                        <TableHeader>Summary</TableHeader>
                        <TableHeader>Saved By</TableHeader>
                        <TableHeader align="right">Date</TableHeader>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {versions.map(ver => (
                        <TableRow key={ver.id}>
                          <TableCell className="font-semibold text-text-primary">v{ver.versionNumber}</TableCell>
                          <TableCell>
                            <StatusBadge
                              status={ver.submittedVersion ? 'Submitted' : 'Draft'}
                              variant={ver.submittedVersion ? 'success' : 'neutral'}
                            />
                          </TableCell>
                          <TableCell className="text-text-secondary">{ver.changeSummary || 'Version snapshot'}</TableCell>
                          <TableCell className="text-text-secondary">{ver.createdByName || 'System'}</TableCell>
                          <TableCell align="right" className="text-text-muted whitespace-nowrap">{new Date(ver.createdAt).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </Card>
        )}

        {activeTab === 'attachments' && (
          <Card>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                marginBottom: "1rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", width: "100%", marginBottom: !isReadOnly ? "0.75rem" : "0" }}>
                <h3 className="text-lg font-medium text-gray-900">
                  Attachments
                </h3>
                <div style={{ marginLeft: "auto" }}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                    disabled={isReadOnly}
                  />
                  <div title={isReadOnly ? "Attachments cannot be added after the Project Brief is submitted." : undefined} style={{ display: 'inline-block' }}>
                    <Button onClick={() => fileInputRef.current?.click()} disabled={uploading || isReadOnly}>
                      {uploading ? 'Uploading...' : <><Upload size={16} className="mr-2" /> Upload File</>}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-body">
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
                        <TableHeader className="text-xs uppercase font-medium text-slate-500 py-3 px-4">Uploaded By</TableHeader>
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
                            {att.createdByName || 'System'}
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
                              {!isReadOnly && (
                                <Button
                                  variant="ghost"
                                  className="text-red-600 py-1 px-3 text-xs h-auto bg-red-50 hover:bg-red-100 hover:text-red-700 rounded-lg border border-transparent"
                                  onClick={() => handleDeleteAttachment(att.id)}
                                  aria-label="Delete attachment"
                                >
                                  <Trash2 size={14} className="mr-1.5 inline" /> Delete
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProjectBriefEditor;

