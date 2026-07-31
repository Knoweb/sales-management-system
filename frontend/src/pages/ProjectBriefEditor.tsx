import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjectBrief, updateProjectBriefDraft, submitProjectBrief } from '../api/projectBriefApi';
import type { ProjectBriefDTO } from '../api/projectBriefApi';

const ProjectBriefEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [brief, setBrief] = useState<ProjectBriefDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    specialConditions: ''
  });

  const loadBrief = useCallback(async (briefId: string) => {
    try {
      setLoading(true);
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
        specialConditions: data.specialConditions || ''
      });
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'expectedBudget' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSaveDraft = async () => {
    if (!id) return;
    try {
      setSaving(true);
      setError(null);
      const updated = await updateProjectBriefDraft(id, {
        ...formData,
        expectedDeadline: formData.expectedDeadline ? new Date(formData.expectedDeadline).toISOString() : undefined,
      });
      setBrief(updated);
      alert('Draft saved successfully');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!id) return;
    if (!window.confirm('Are you sure you want to submit this Project Brief? You will not be able to edit it afterwards.')) {
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      
      // Save draft first
      await updateProjectBriefDraft(id, {
        ...formData,
        expectedDeadline: formData.expectedDeadline ? new Date(formData.expectedDeadline).toISOString() : undefined,
      });

      // Then submit
      await submitProjectBrief(id, { confirmation: true });
      navigate(`/opportunities/${brief?.opportunityId}`);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Failed to submit brief');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!brief) return <div className="p-6">Brief not found</div>;

  const isReadOnly = brief.status === 'SUBMITTED';

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project Brief: {brief.projectTitle}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Status: <span className="font-semibold text-blue-600">{brief.status}</span> | 
            Deadline: <span className={`font-semibold ${brief.overdue ? 'text-red-600' : 'text-gray-900'}`}>{new Date(brief.dueAt).toLocaleString()}</span>
          </p>
        </div>
        {!isReadOnly && (
          <div className="space-x-3">
            <button
              onClick={handleSaveDraft}
              disabled={saving || submitting}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 border border-gray-300 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving || submitting}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Brief'}
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div className="grid grid-cols-1 gap-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Project Title</label>
            <input
              type="text"
              name="projectTitle"
              value={formData.projectTitle}
              onChange={handleChange}
              readOnly={isReadOnly}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Business Problem</label>
            <textarea
              name="businessProblem"
              value={formData.businessProblem}
              onChange={handleChange}
              readOnly={isReadOnly}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Required Solution</label>
            <textarea
              name="requiredSolution"
              value={formData.requiredSolution}
              onChange={handleChange}
              readOnly={isReadOnly}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Project Scope</label>
            <textarea
              name="projectScope"
              value={formData.projectScope}
              onChange={handleChange}
              readOnly={isReadOnly}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Technical Requirements</label>
            <textarea
              name="technicalRequirements"
              value={formData.technicalRequirements}
              onChange={handleChange}
              readOnly={isReadOnly}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Expected Budget</label>
              <input
                type="number"
                name="expectedBudget"
                value={formData.expectedBudget}
                onChange={handleChange}
                readOnly={isReadOnly}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Currency</label>
              <input
                type="text"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                readOnly={isReadOnly}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProjectBriefEditor;
