/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDepartmentEstimate, saveDepartmentEstimate, submitDepartmentEstimate, type DepartmentEstimateDTO, type DepartmentEstimateSaveRequest, type EstimateLineItemCategory, type DepartmentEstimateLineItemRequest } from '../../services/TechnicalCostingApi';
import { StatusBadge } from '../../components/StatusBadge';
import { LoadingState } from '../../components/FeedbackStates';
import { Button } from '../../components/Button';
import { Save, Send, ArrowLeft, Plus, Trash2, Calculator } from 'lucide-react';
import './DepartmentEstimateEditorPage.css';

const CATEGORIES: { value: EstimateLineItemCategory; label: string }[] = [
  { value: 'MATERIALS', label: 'Materials' },
  { value: 'LABOUR', label: 'Labour' },
  { value: 'SOFTWARE', label: 'Software' },
  { value: 'MACHINES_EQUIPMENT', label: 'Machines/Equipment' },
  { value: 'TRANSPORT', label: 'Transport' },
  { value: 'INSTALLATION', label: 'Installation' },
  { value: 'TESTING', label: 'Testing' },
  { value: 'SUBCONTRACTING', label: 'Subcontracting' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'CONTINGENCY', label: 'Contingency' },
  { value: 'TAX_OTHER_COSTS', label: 'Tax & Other Costs' }
];

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

export const DepartmentEstimateEditorPage: React.FC = () => {
  const { projectId, departmentId } = useParams<{ projectId: string; departmentId: string }>();
  const navigate = useNavigate();

  const [estimate, setEstimate] = useState<DepartmentEstimateDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [formData, setFormData] = useState<DepartmentEstimateSaveRequest>({
    contingencyPercentage: 0,
    taxPercentage: 0,
    marginPercentage: 0,
    designDurationDays: 0,
    procurementDurationDays: 0,
    developmentDurationDays: 0,
    testingDurationDays: 0,
    installationDurationDays: 0,
    trainingDurationDays: 0,
    deliveryDurationDays: 0,
    lineItems: []
  });

  const fetchEstimate = useCallback(async () => {
    if (!projectId || !departmentId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getDepartmentEstimate(projectId, departmentId);
      setEstimate(data);
      
      if (data) {
        setFormData({
          contingencyPercentage: data.contingencyPercentage || 0,
          taxPercentage: data.taxPercentage || 0,
          marginPercentage: data.marginPercentage || 0,
          designDurationDays: data.designDurationDays || 0,
          procurementDurationDays: data.procurementDurationDays || 0,
          developmentDurationDays: data.developmentDurationDays || 0,
          testingDurationDays: data.testingDurationDays || 0,
          installationDurationDays: data.installationDurationDays || 0,
          trainingDurationDays: data.trainingDurationDays || 0,
          deliveryDurationDays: data.deliveryDurationDays || 0,
          lineItems: data.lineItems.map(item => ({
            id: item.id,
            category: item.category,
            description: item.description,
            quantity: item.quantity,
            unitOfMeasure: item.unitOfMeasure,
            unitCost: item.unitCost,
            employeeAllocationId: item.employeeAllocationId,
            notes: item.notes
          }))
        });
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        // Missing estimate, that's fine, we start with defaults.
        setEstimate({
          status: 'DRAFT',
          versionNumber: 1,
          departmentName: 'Loading...',
          finalTotal: 0,
          subtotal: 0
        } as unknown as DepartmentEstimateDTO);
      } else {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to load estimate.');
      }
    } finally {
      setLoading(false);
    }
  }, [projectId, departmentId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEstimate();
  }, [fetchEstimate]);

  const handleSaveDraft = async () => {
    if (!projectId || !departmentId) return;
    try {
      setActionLoading(true);
      setError(null);
      const updated = await saveDepartmentEstimate(projectId, departmentId, formData);
      setEstimate(updated);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to save draft.');
      window.scrollTo(0, 0);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!projectId || !departmentId) return;
    if (!window.confirm("Submit this estimate? You will no longer be able to edit it unless a revision is requested.")) return;
    
    try {
      setActionLoading(true);
      setError(null);
      // Ensure we save first if it's draft
      if (estimate?.status === 'DRAFT' || estimate?.status === 'REVISION_REQUESTED' || !estimate?.id) {
         await saveDepartmentEstimate(projectId, departmentId, formData);
      }
      const updated = await submitDepartmentEstimate(projectId, departmentId);
      setEstimate(updated);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit estimate.');
      window.scrollTo(0, 0);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddLineItem = () => {
    setFormData(prev => ({
      ...prev,
      lineItems: [
        ...prev.lineItems,
        {
          category: 'LABOUR',
          description: '',
          quantity: 1,
          unitOfMeasure: 'Hours',
          unitCost: 0
        }
      ]
    }));
  };

  const handleRemoveLineItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      lineItems: prev.lineItems.filter((_, i) => i !== index)
    }));
  };

  const updateLineItem = (index: number, field: keyof DepartmentEstimateLineItemRequest, value: any) => {
    setFormData(prev => {
      const newItems = [...prev.lineItems];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, lineItems: newItems };
    });
  };

  const isReadOnly = estimate?.status === 'SUBMITTED' || estimate?.status === 'APPROVED';

  // Calculate live totals for preview
  const liveSubtotal = formData.lineItems.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.unitCost)), 0);
  const liveContingency = liveSubtotal * (Number(formData.contingencyPercentage) / 100);
  const liveTax = (liveSubtotal + liveContingency) * (Number(formData.taxPercentage) / 100);
  const liveMargin = (liveSubtotal + liveContingency + liveTax) * (Number(formData.marginPercentage) / 100);
  const liveTotal = liveSubtotal + liveContingency + liveTax + liveMargin;
  const totalDays = formData.designDurationDays + formData.procurementDurationDays + formData.developmentDurationDays + 
                    formData.testingDurationDays + formData.installationDurationDays + formData.trainingDurationDays + 
                    formData.deliveryDurationDays;

  if (loading) {
    return <div style={{ padding: '2rem' }}><LoadingState message="Loading estimate..." /></div>;
  }

  return (
    <div className="deep-container">
      
      {/* Page Header Card */}
      <div className="deep-header-card">
        <div className="deep-header-back-row">
          <Button variant="secondary" onClick={() => navigate(-1)} icon={<ArrowLeft size={16} />}>Back</Button>
        </div>
        <div className="deep-header-title-area">
          <div className="deep-header-title-row">
            <h1 className="deep-header-title">{estimate?.departmentName || 'Department'} Estimate</h1>
            {estimate?.status && <StatusBadge status={estimate.status} />}
          </div>
          <p className="deep-header-subtitle">Version {estimate?.versionNumber || 1}</p>
        </div>
      </div>

      {error && (
        <div className="deep-alert-error">
          {error}
        </div>
      )}

      {estimate?.revisionNotes && estimate.status === 'REVISION_REQUESTED' && (
        <div className="deep-alert-warning">
          <strong>Revision Requested:</strong> {estimate.revisionNotes}
        </div>
      )}

      {/* Line Items Card */}
      <div className="deep-section-card">
        <div className="deep-section-header">
          <h3 className="deep-section-title">
            <Calculator size={20} style={{ color: 'var(--color-text-muted)' }} />
            Line Items
          </h3>
          {!isReadOnly && (
            <Button variant="secondary" onClick={handleAddLineItem}>
              <Plus size={16} style={{ marginRight: '8px' }} />
              Add Item
            </Button>
          )}
        </div>

        {formData.lineItems.length > 0 ? (
          <div className="deep-table-container">
            <table className="deep-table">
              <thead>
                <tr>
                  <th style={{ width: '20%' }}>Category</th>
                  <th style={{ width: '30%' }}>Description</th>
                  <th style={{ width: '10%' }}>Qty</th>
                  <th style={{ width: '10%' }}>Unit</th>
                  <th style={{ width: '15%' }} className="deep-table-align-right">Unit Cost</th>
                  <th style={{ width: '15%' }} className="deep-table-align-right">Total</th>
                  {!isReadOnly && <th style={{ width: '60px' }}></th>}
                </tr>
              </thead>
              <tbody>
                {formData.lineItems.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <select
                        className="deep-select"
                        value={item.category}
                        onChange={(e: any) => updateLineItem(index, 'category', e.target.value)}
                        disabled={isReadOnly}
                      >
                        {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                    </td>
                    <td>
                      <input
                        className="deep-input"
                        value={item.description}
                        onChange={(e: any) => updateLineItem(index, 'description', e.target.value)}
                        placeholder="Description"
                        disabled={isReadOnly}
                      />
                    </td>
                    <td>
                      <input
                        className="deep-input"
                        type="number"
                        step="0.01"
                        min="0.0001"
                        value={item.quantity}
                        onChange={(e: any) => updateLineItem(index, 'quantity', e.target.value)}
                        disabled={isReadOnly}
                      />
                    </td>
                    <td>
                      <input
                        className="deep-input"
                        value={item.unitOfMeasure}
                        onChange={(e: any) => updateLineItem(index, 'unitOfMeasure', e.target.value)}
                        placeholder="e.g. Hrs"
                        disabled={isReadOnly}
                      />
                    </td>
                    <td>
                      <input
                        className="deep-input deep-table-align-right"
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unitCost}
                        onChange={(e: any) => updateLineItem(index, 'unitCost', e.target.value)}
                        disabled={isReadOnly}
                      />
                    </td>
                    <td>
                      <div className="deep-table-total-text">
                        {formatCurrency(Number(item.quantity) * Number(item.unitCost))}
                      </div>
                    </td>
                    {!isReadOnly && (
                      <td style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                        <button
                          className="deep-btn-icon-only"
                          onClick={() => handleRemoveLineItem(index)}
                          title="Remove Item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="deep-empty-state">
            No line items added yet. Click "Add Item" to start building the estimate.
          </div>
        )}
      </div>

      {/* Financials Card */}
      <div className="deep-section-card">
        <div className="deep-section-header">
          <h3 className="deep-section-title">Financials (%)</h3>
        </div>
        
        <div className="deep-financials-input-grid">
          <div className="deep-input-group">
            <label className="deep-input-label">Contingency %</label>
            <input
              className="deep-input"
              type="number"
              min="0" step="0.1"
              value={formData.contingencyPercentage}
              onChange={(e: any) => setFormData(prev => ({ ...prev, contingencyPercentage: Number(e.target.value) }))}
              disabled={isReadOnly}
            />
          </div>
          <div className="deep-input-group">
            <label className="deep-input-label">Tax %</label>
            <input
              className="deep-input"
              type="number"
              min="0" step="0.1"
              value={formData.taxPercentage}
              onChange={(e: any) => setFormData(prev => ({ ...prev, taxPercentage: Number(e.target.value) }))}
              disabled={isReadOnly}
            />
          </div>
          <div className="deep-input-group">
            <label className="deep-input-label">Margin %</label>
            <input
              className="deep-input"
              type="number"
              min="0" step="0.1"
              value={formData.marginPercentage}
              onChange={(e: any) => setFormData(prev => ({ ...prev, marginPercentage: Number(e.target.value) }))}
              disabled={isReadOnly}
            />
          </div>
        </div>

        <div className="deep-financial-summary">
          <div className="deep-financial-summary-item">
            <span className="deep-financial-summary-label">Subtotal</span>
            <span className="deep-financial-summary-value">{formatCurrency(liveSubtotal)}</span>
          </div>
          <div className="deep-financial-summary-item">
            <span className="deep-financial-summary-label">Contingency</span>
            <span className="deep-financial-summary-value">{formatCurrency(liveContingency)}</span>
          </div>
          <div className="deep-financial-summary-item">
            <span className="deep-financial-summary-label">Tax</span>
            <span className="deep-financial-summary-value">{formatCurrency(liveTax)}</span>
          </div>
          <div className="deep-financial-summary-item">
            <span className="deep-financial-summary-label">Margin</span>
            <span className="deep-financial-summary-value">{formatCurrency(liveMargin)}</span>
          </div>
          <div className="deep-financial-summary-item-final">
            <span className="deep-financial-summary-label-final">Final Total</span>
            <span className="deep-financial-summary-value-final">{formatCurrency(liveTotal)}</span>
          </div>
        </div>
      </div>

      {/* Timeline Card */}
      <div className="deep-section-card">
        <div className="deep-section-header">
          <h3 className="deep-section-title">Timeline (Days)</h3>
        </div>

        <div className="deep-timeline-grid">
          {[
            { label: 'Design', key: 'designDurationDays' },
            { label: 'Procurement', key: 'procurementDurationDays' },
            { label: 'Development', key: 'developmentDurationDays' },
            { label: 'Testing', key: 'testingDurationDays' },
            { label: 'Installation', key: 'installationDurationDays' },
            { label: 'Training', key: 'trainingDurationDays' },
            { label: 'Delivery', key: 'deliveryDurationDays' }
          ].map(field => (
            <div key={field.key} className="deep-input-group">
              <label className="deep-input-label">{field.label}</label>
              <input
                className="deep-input"
                type="number"
                min="0"
                value={(formData as any)[field.key]}
                onChange={(e: any) => setFormData(prev => ({ ...prev, [field.key]: Number(e.target.value) }))}
                disabled={isReadOnly}
              />
            </div>
          ))}
        </div>

        <div className="deep-timeline-total-card">
          <span className="deep-timeline-total-label">Total Timeline</span>
          <span className="deep-timeline-total-value">{totalDays} Days</span>
        </div>
      </div>

      {!isReadOnly && (
        <div className="deep-page-actions">
          <Button 
            variant="secondary" 
            onClick={handleSaveDraft} 
            disabled={actionLoading} 
            isLoading={actionLoading}
            icon={<Save size={16} />}
          >
            Save Draft
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit} 
            disabled={actionLoading || formData.lineItems.length === 0} 
            isLoading={actionLoading}
            icon={<Send size={16} />}
          >
            Submit Estimate
          </Button>
        </div>
      )}

    </div>
  );
};
