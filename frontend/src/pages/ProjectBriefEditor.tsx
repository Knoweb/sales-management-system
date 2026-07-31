import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getProjectBrief, 
  updateProjectBriefDraft, 
  saveProjectBriefVersion, 
  submitProjectBrief,
  getProjectBriefVersions,
  getProjectBriefAttachments,
  uploadProjectBriefAttachment,
  deleteProjectBriefAttachment,
  type ProjectBriefDTO,
  type ProjectBriefVersionDTO,
  type ProjectBriefAttachmentDTO
} from '../api/projectBriefApi';
import { DepartmentApi } from '../services/DepartmentApi';
import type { Department } from '../types/department';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Input, Textarea, Checkbox } from '../components/Forms';
import { Button } from '../components/Button';
import { ErrorState, LoadingState } from '../components/FeedbackStates';
import { StatusBadge } from '../components/StatusBadge';
import { Tabs, type TabItem } from '../components/Tabs';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../components/Table';
import { FileText, Save, Send, History, Paperclip, Upload, Trash2, Download, AlertTriangle } from 'lucide-react';

const ProjectBriefEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [brief, setBrief] = useState<ProjectBriefDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('edit');

  const [allDepartments, setAllDepartments] = useState<Department[]>([]);
  const [versions, setVersions] = useState<ProjectBriefVersionDTO[]>([]);
  const [attachments, setAttachments] = useState<ProjectBriefAttachmentDTO[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    projectTitle: '',
    businessProblem: '',
    requiredSolution: '',
    projectScope: '',
    technicalRequirements: '',
    expectedBudget: 0,
    currency: 'USD',
    expectedDeadline: '',
    siteName: '',
    siteAddress: '',
    siteInformation: '',
    meetingNotes: '',
    specialConditions: '',
    requiredDepartmentIds: [] as string[]
  });

  const loadBrief = useCallback(async (briefId: string) => {
    try {
      setLoading(true);
      setError(null);
      setConflictError(null);
      const data = await getProjectBrief(briefId);
      setBrief(data);
      setFormData({
        projectTitle: data.projectTitle || '',
        businessProblem: data.businessProblem || '',
        requiredSolution: data.requiredSolution || '',
        projectScope: data.projectScope || '',
        technicalRequirements: data.technicalRequirements || '',
        expectedBudget: data.expectedBudget || 0,
        currency: data.currency || 'USD',
        expectedDeadline: data.expectedDeadline ? data.expectedDeadline.substring(0, 10) : '',
        siteName: data.siteName || '',
        siteAddress: data.siteAddress || '',
        siteInformation: data.siteInformation || '',
        meetingNotes: data.meetingNotes || '',
        specialConditions: data.specialConditions || '',
        requiredDepartmentIds: data.requiredDepartments ? data.requiredDepartments.map(d => d.id) : []
      });

      // Load auxiliary data asynchronously
      DepartmentApi.search().then(res => setAllDepartments(res.content || [])).catch(() => {});
      getProjectBriefVersions(briefId).then(setVersions).catch(() => {});
      getProjectBriefAttachments(briefId).then(setAttachments).catch(() => {});
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Failed to load project brief');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadBrief(id);
    }
  }, [id, loadBrief]);

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

  const handleSaveDraft = async () => {
    if (!id || !brief) return;
    try {
      setSaving(true);
      setError(null);
      setConflictError(null);
      const updated = await updateProjectBriefDraft(id, {
        ...formData,
        expectedDeadline: formData.expectedDeadline ? new Date(formData.expectedDeadline).toISOString() : undefined,
      });
      setBrief(updated);
    } catch (err: unknown) {
      const e = err as { response?: { status?: number, data?: { message?: string } } };
      if (e.response?.status === 409) {
        setConflictError(e.response?.data?.message || 'Version conflict! Someone else updated this brief.');
      } else {
        setError(e.response?.data?.message || 'Failed to save draft');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSaveVersion = async () => {
    if (!id || !brief) return;
    try {
      setSaving(true);
      setError(null);
      setConflictError(null);
      const updated = await saveProjectBriefVersion(id, {
        ...formData,
        expectedDeadline: formData.expectedDeadline ? new Date(formData.expectedDeadline).toISOString() : undefined,
      });
      setBrief(updated);
      const vers = await getProjectBriefVersions(id);
      setVersions(vers);
    } catch (err: unknown) {
      const e = err as { response?: { status?: number, data?: { message?: string } } };
      if (e.response?.status === 409) {
        setConflictError(e.response?.data?.message || 'Version conflict! Someone else updated this brief.');
      } else {
        setError(e.response?.data?.message || 'Failed to save version');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!id || !brief) return;
    if (!window.confirm('Are you sure you want to submit this Project Brief? Submitted briefs become read-only.')) {
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      setConflictError(null);
      
      // Save draft first
      await updateProjectBriefDraft(id, {
        ...formData,
        expectedDeadline: formData.expectedDeadline ? new Date(formData.expectedDeadline).toISOString() : undefined,
      });

      // Submit
      await submitProjectBrief(id, { confirmation: true });
      navigate(`/opportunities/${brief.opportunityId}`);
    } catch (err: unknown) {
      const e = err as { response?: { status?: number, data?: { message?: string } } };
      if (e.response?.status === 409) {
        setConflictError(e.response?.data?.message || 'Conflict! Cannot submit brief.');
      } else {
        setError(e.response?.data?.message || 'Failed to submit brief');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadFile = async () => {
    if (!id || !selectedFile) return;
    try {
      setUploading(true);
      setError(null);
      await uploadProjectBriefAttachment(id, selectedFile);
      setSelectedFile(null);
      const atts = await getProjectBriefAttachments(id);
      setAttachments(atts);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Failed to upload attachment');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAttachment = async (attId: string) => {
    if (!id || !window.confirm('Are you sure you want to delete this attachment?')) return;
    try {
      await deleteProjectBriefAttachment(id, attId);
      setAttachments(prev => prev.filter(a => a.id !== attId));
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Failed to delete attachment');
    }
  };

  if (loading) return <div className="p-6 max-w-7xl mx-auto"><LoadingState message="Loading project brief..." /></div>;
  if (error && !brief) return <div className="p-6 max-w-7xl mx-auto"><ErrorState message={error} onRetry={() => id && loadBrief(id)} /></div>;
  if (!brief) return <div className="p-6 max-w-7xl mx-auto"><ErrorState message="Brief not found" /></div>;

  const isReadOnly = brief.status === 'SUBMITTED';

  const tabs: TabItem[] = [
    { id: 'edit', label: 'Brief Details', icon: <FileText size={18} /> },
    { id: 'versions', label: `Versions (${versions.length})`, icon: <History size={18} /> },
    { id: 'attachments', label: `Attachments (${attachments.length})`, icon: <Paperclip size={18} /> }
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto w-full space-y-6">
      <PageHeader 
        title={`Project Brief: ${brief.projectTitle || 'Untitled'}`}
        icon={<FileText size={24} />}
        description={`Version: v${brief.currentVersionNumber}`}
        actionElement={
          <div className="ml-4 flex gap-3 items-center">
            <StatusBadge status={brief.status} variant={brief.status === 'SUBMITTED' ? 'success' : 'neutral'} />
          </div>
        }
      />

      {conflictError && (
        <div className="p-4 bg-danger-bg text-danger border border-danger-border rounded-md flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle />
            <span>{conflictError}</span>
          </div>
          <Button variant="outline" onClick={() => id && loadBrief(id)}>Reload Latest</Button>
        </div>
      )}

      {error && <ErrorState message={error} />}

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {!isReadOnly && activeTab === 'edit' && (
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" onClick={handleSaveDraft} isLoading={saving} icon={<Save />}>
              Save Draft
            </Button>
            <Button variant="secondary" onClick={handleSaveVersion} isLoading={saving} icon={<History />}>
              Save Version
            </Button>
            <Button variant="primary" onClick={handleSubmit} isLoading={submitting} icon={<Send />}>
              Submit Brief
            </Button>
          </div>
        )}
      </div>

      <div className="mt-6">
        {activeTab === 'edit' && (
          <Card>
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Project Title"
                  type="text"
                  name="projectTitle"
                  value={formData.projectTitle}
                  onChange={handleChange}
                  disabled={isReadOnly}
                  required
                />
                <Input
                  label="Expected Deadline"
                  type="date"
                  name="expectedDeadline"
                  value={formData.expectedDeadline}
                  onChange={handleChange}
                  disabled={isReadOnly}
                  required
                />
              </div>

              <Textarea
                label="Business Problem"
                name="businessProblem"
                value={formData.businessProblem}
                onChange={handleChange}
                disabled={isReadOnly}
                rows={3}
                placeholder="Describe the business problem..."
                required
              />

              <Textarea
                label="Required Solution"
                name="requiredSolution"
                value={formData.requiredSolution}
                onChange={handleChange}
                disabled={isReadOnly}
                rows={3}
                placeholder="Describe the required solution..."
                required
              />

              <Textarea
                label="Project Scope"
                name="projectScope"
                value={formData.projectScope}
                onChange={handleChange}
                disabled={isReadOnly}
                rows={3}
                placeholder="Detail the scope of work..."
                required
              />

              <Textarea
                label="Technical Requirements"
                name="technicalRequirements"
                value={formData.technicalRequirements}
                onChange={handleChange}
                disabled={isReadOnly}
                rows={3}
                placeholder="List technical constraints and stack..."
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Expected Budget"
                  type="number"
                  name="expectedBudget"
                  value={formData.expectedBudget}
                  onChange={handleChange}
                  disabled={isReadOnly}
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
                  required
                />
              </div>

              <div>
                <label className="form-label mb-2 block">Required Departments <span className="form-required">*</span></label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-4 border border-border rounded-md bg-surface-secondary">
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
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'versions' && (
          <Card>
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2 border-b border-border pb-4">
              <History className="text-primary" /> Version History
            </h3>
            {versions.length === 0 ? (
              <div className="text-center py-8 text-text-muted">
                No historical versions saved yet.
              </div>
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
          </Card>
        )}

        {activeTab === 'attachments' && (
          <Card>
            <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
              <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                <Paperclip className="text-primary" /> Project Brief Attachments
              </h3>
            </div>

            {!isReadOnly && (
              <div className="mb-8 p-6 border-2 border-dashed border-border rounded-lg bg-surface-secondary flex flex-col items-center justify-center text-center">
                <Upload className="text-text-muted mb-3" />
                <p className="text-body font-medium mb-1">Upload a new attachment</p>
                <p className="text-body-small text-text-muted mb-4">Supported files: PDF, DOCX, XLSX, Images (Max 10MB)</p>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm">
                  <input
                    type="file"
                    onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                  />
                  <Button 
                    variant="primary" 
                    onClick={handleUploadFile} 
                    disabled={!selectedFile} 
                    isLoading={uploading}
                    icon={<Upload />}
                  >
                    Upload
                  </Button>
                </div>
              </div>
            )}

            {attachments.length === 0 ? (
              <div className="text-center py-8 text-text-muted">
                No attachments uploaded yet.
              </div>
            ) : (
              <div className="table-container">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeader>File Name</TableHeader>
                      <TableHeader>Type</TableHeader>
                      <TableHeader>Size</TableHeader>
                      <TableHeader>Uploaded By</TableHeader>
                      <TableHeader align="right">Actions</TableHeader>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {attachments.map(att => (
                      <TableRow key={att.id}>
                        <TableCell className="font-medium text-text-primary">
                          <div className="flex items-center gap-2">
                            <FileText className="text-text-muted" />
                            {att.fileName}
                          </div>
                        </TableCell>
                        <TableCell className="text-text-secondary">{att.fileType || '-'}</TableCell>
                        <TableCell className="text-text-secondary">{att.fileSize ? `${(att.fileSize / 1024).toFixed(1)} KB` : '-'}</TableCell>
                        <TableCell className="text-text-secondary">{att.createdByName || 'System'}</TableCell>
                        <TableCell align="right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              icon={<Download />}
                              onClick={() => window.open(att.fileUrl, '_blank')}
                            >
                              Download
                            </Button>
                            {!isReadOnly && (
                              <Button
                                variant="outline"
                                className="text-danger border-danger/30 hover:bg-danger-bg hover:text-danger hover:border-danger"
                                icon={<Trash2 />}
                                onClick={() => handleDeleteAttachment(att.id)}
                                aria-label="Delete attachment"
                              >
                                Delete
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
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProjectBriefEditor;
