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
import { Input } from '../components/Forms';
import { Button } from '../components/Button';
import { ErrorState, LoadingState } from '../components/FeedbackStates';
import { StatusBadge } from '../components/StatusBadge';
import { Tabs } from '../components/Tabs';
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
  const [activeTab, setActiveTab] = useState<'edit' | 'versions' | 'attachments'>('edit');

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

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <PageHeader 
        title={<><FileText size={24} className="inline-icon text-blue-600" /> Project Brief: {brief.projectTitle || 'Untitled'}</>}
        description={`Status: ${brief.status} | Version: v${brief.currentVersionNumber}`}
      />

      {conflictError && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-800 font-medium">
            <AlertTriangle size={20} />
            <span>{conflictError}</span>
          </div>
          <Button variant="outline" onClick={() => id && loadBrief(id)}>Reload Latest</Button>
        </div>
      )}

      {error && <div className="mb-6"><ErrorState message={error} /></div>}

      <div className="flex justify-between items-center mb-6">
        <Tabs
          tabs={[
            { id: 'edit', label: 'Brief Details' },
            { id: 'versions', label: `Versions (${versions.length})` },
            { id: 'attachments', label: `Attachments (${attachments.length})` }
          ]}
          activeTab={activeTab}
          onChange={(tab) => setActiveTab(tab as typeof activeTab)}
        />

        {!isReadOnly && activeTab === 'edit' && (
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleSaveDraft} isLoading={saving} icon={<Save size={16} />}>
              Save Draft
            </Button>
            <Button variant="secondary" onClick={handleSaveVersion} isLoading={saving} icon={<History size={16} />}>
              Save Version
            </Button>
            <Button variant="primary" onClick={handleSubmit} isLoading={submitting} icon={<Send size={16} />}>
              Submit Brief
            </Button>
          </div>
        )}
      </div>

      {activeTab === 'edit' && (
        <Card>
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Project Title *"
                type="text"
                name="projectTitle"
                value={formData.projectTitle}
                onChange={handleChange}
                disabled={isReadOnly}
                required
              />
              <Input
                label="Expected Deadline *"
                type="date"
                name="expectedDeadline"
                value={formData.expectedDeadline}
                onChange={handleChange}
                disabled={isReadOnly}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Business Problem *</label>
              <textarea
                name="businessProblem"
                value={formData.businessProblem}
                onChange={handleChange}
                disabled={isReadOnly}
                rows={3}
                className="form-textarea"
                placeholder="Describe the business problem..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Required Solution *</label>
              <textarea
                name="requiredSolution"
                value={formData.requiredSolution}
                onChange={handleChange}
                disabled={isReadOnly}
                rows={3}
                className="form-textarea"
                placeholder="Describe the required solution..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Project Scope *</label>
              <textarea
                name="projectScope"
                value={formData.projectScope}
                onChange={handleChange}
                disabled={isReadOnly}
                rows={3}
                className="form-textarea"
                placeholder="Detail the scope of work..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Technical Requirements *</label>
              <textarea
                name="technicalRequirements"
                value={formData.technicalRequirements}
                onChange={handleChange}
                disabled={isReadOnly}
                rows={3}
                className="form-textarea"
                placeholder="List technical constraints and stack..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Expected Budget *"
                type="number"
                name="expectedBudget"
                value={formData.expectedBudget}
                onChange={handleChange}
                disabled={isReadOnly}
                required
                min="0"
              />
              <Input
                label="Currency *"
                type="text"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                disabled={isReadOnly}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Required Departments *</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                {allDepartments.map(dept => {
                  const checked = formData.requiredDepartmentIds.includes(dept.id);
                  return (
                    <label key={dept.id} className="flex items-center gap-2 p-2 border rounded-md cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => !isReadOnly && handleDepartmentToggle(dept.id)}
                        disabled={isReadOnly}
                      />
                      <span className="text-sm text-gray-700">{dept.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'versions' && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <History size={20} /> Version History
          </h3>
          {versions.length === 0 ? (
            <p className="text-gray-500 py-4">No historical versions saved yet.</p>
          ) : (
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
                    <TableCell className="font-semibold text-gray-900">v{ver.versionNumber}</TableCell>
                    <TableCell>
                      <StatusBadge 
                        status={ver.submittedVersion ? 'Submitted' : 'Draft'} 
                        variant={ver.submittedVersion ? 'success' : 'neutral'} 
                      />
                    </TableCell>
                    <TableCell>{ver.changeSummary || 'Version snapshot'}</TableCell>
                    <TableCell>{ver.createdByName || 'System'}</TableCell>
                    <TableCell align="right">{new Date(ver.createdAt).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      )}

      {activeTab === 'attachments' && (
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Paperclip size={20} /> Project Brief Attachments
            </h3>
          </div>

          {!isReadOnly && (
            <div className="mb-6 p-4 border border-dashed border-gray-300 rounded-lg flex items-center justify-between gap-4">
              <input
                type="file"
                onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <Button 
                variant="primary" 
                onClick={handleUploadFile} 
                disabled={!selectedFile} 
                isLoading={uploading}
                icon={<Upload size={16} />}
              >
                Upload File
              </Button>
            </div>
          )}

          {attachments.length === 0 ? (
            <p className="text-gray-500 py-4">No attachments uploaded yet.</p>
          ) : (
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
                    <TableCell className="font-medium text-gray-900">{att.fileName}</TableCell>
                    <TableCell>{att.fileType || '-'}</TableCell>
                    <TableCell>{att.fileSize ? `${(att.fileSize / 1024).toFixed(1)} KB` : '-'}</TableCell>
                    <TableCell>{att.createdByName || 'System'}</TableCell>
                    <TableCell align="right">
                      <div className="flex justify-end gap-2">
                        <a 
                          href={att.fileUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="btn btn-ghost text-blue-600 inline-flex items-center gap-1 text-sm p-1.5"
                        >
                          <Download size={16} /> Download
                        </a>
                        {!isReadOnly && (
                          <button 
                            onClick={() => handleDeleteAttachment(att.id)}
                            className="btn btn-ghost text-red-600 p-1.5"
                            title="Delete attachment"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      )}
    </div>
  );
};

export default ProjectBriefEditor;
