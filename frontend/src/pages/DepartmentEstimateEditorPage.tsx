/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDepartmentEstimate, saveDepartmentEstimate, submitDepartmentEstimate, type DepartmentEstimateDTO, type DepartmentEstimateSaveRequest, type EstimateLineItemCategory, type DepartmentEstimateLineItemRequest } from '../services/TechnicalCostingApi';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingState } from '../components/FeedbackStates';
import { Button } from '../components/Button';
import { Input, Select } from '../components/Forms';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../components/Table';
import { Save, Send, ArrowLeft, Plus, Trash2, Calculator } from 'lucide-react';

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

  if (loading) {
    return <div className="p-8"><LoadingState message="Loading estimate..." /></div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="secondary" onClick={() => navigate(-1)} icon={<ArrowLeft className="w-4 h-4" />}>Back</Button>
          <PageHeader
            title={`${estimate?.departmentName || 'Department'} Estimate`}
            description={`Version ${estimate?.versionNumber || 1}`}
          />
        </div>
        <div className="flex items-center space-x-4">
          {estimate?.status && <StatusBadge status={estimate.status} />}
          {!isReadOnly && (
            <>
              <Button 
                variant="secondary" 
                onClick={handleSaveDraft} 
                disabled={actionLoading} 
                isLoading={actionLoading}
                icon={<Save className="w-4 h-4" />}
              >
                Save Draft
              </Button>
              <Button 
                variant="primary" 
                onClick={handleSubmit} 
                disabled={actionLoading || formData.lineItems.length === 0} 
                isLoading={actionLoading}
                icon={<Send className="w-4 h-4" />}
              >
                Submit Estimate
              </Button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200 shadow-sm">
          {error}
        </div>
      )}

      {estimate?.revisionNotes && estimate.status === 'REVISION_REQUESTED' && (
        <div className="p-4 bg-yellow-50 text-yellow-800 rounded-md border border-yellow-200">
          <strong>Revision Requested:</strong> {estimate.revisionNotes}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Main Editor - Line Items */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-gray-500" />
                Line Items
              </h3>
              {!isReadOnly && (
              <Button variant="secondary" onClick={handleAddLineItem}>
                <Plus className="w-4 h-4 mr-2 inline-block" />
                Add Item
              </Button>
              )}
            </div>

            {formData.lineItems.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeader className="w-1/4">Category</TableHeader>
                      <TableHeader className="w-1/3">Description</TableHeader>
                      <TableHeader className="w-24">Qty</TableHeader>
                      <TableHeader className="w-24">Unit</TableHeader>
                      <TableHeader className="w-32">Unit Cost</TableHeader>
                      <TableHeader className="w-32 text-right">Total</TableHeader>
                      {!isReadOnly && <TableHeader className="w-16">Actions</TableHeader>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.lineItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Select
                            value={item.category}
                            onChange={(e: any) => updateLineItem(index, 'category', e.target.value)}
                            disabled={isReadOnly}
                          >
                            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            value={item.description}
                            onChange={(e: any) => updateLineItem(index, 'description', e.target.value)}
                            placeholder="Description"
                            disabled={isReadOnly}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            min="0.0001"
                            value={item.quantity}
                            onChange={(e: any) => updateLineItem(index, 'quantity', e.target.value)}
                            disabled={isReadOnly}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={item.unitOfMeasure}
                            onChange={(e: any) => updateLineItem(index, 'unitOfMeasure', e.target.value)}
                            placeholder="e.g. Hrs"
                            disabled={isReadOnly}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.unitCost}
                            onChange={(e: any) => updateLineItem(index, 'unitCost', e.target.value)}
                            disabled={isReadOnly}
                          />
                        </TableCell>
                        <TableCell className="text-right font-medium text-gray-900 align-middle">
                          ${(Number(item.quantity) * Number(item.unitCost)).toFixed(2)}
                        </TableCell>
                        {!isReadOnly && (
                          <TableCell className="text-right align-middle">
                            <button
                              onClick={() => handleRemoveLineItem(index)}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Remove Item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-md">
                No line items added yet. Click "Add Item" to start building the estimate.
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar - Timeline & Summary */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Financials (%)</h3>
            <div className="space-y-4">
              <Input
                label="Contingency %"
                type="number"
                min="0" step="0.1"
                value={formData.contingencyPercentage}
                onChange={(e: any) => setFormData(prev => ({ ...prev, contingencyPercentage: Number(e.target.value) }))}
                disabled={isReadOnly}
              />
              <Input
                label="Tax %"
                type="number"
                min="0" step="0.1"
                value={formData.taxPercentage}
                onChange={(e: any) => setFormData(prev => ({ ...prev, taxPercentage: Number(e.target.value) }))}
                disabled={isReadOnly}
              />
              <Input
                label="Margin %"
                type="number"
                min="0" step="0.1"
                value={formData.marginPercentage}
                onChange={(e: any) => setFormData(prev => ({ ...prev, marginPercentage: Number(e.target.value) }))}
                disabled={isReadOnly}
              />
              
              <div className="pt-4 mt-4 border-t border-gray-200 space-y-2 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>${liveSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Contingency</span>
                  <span>${liveContingency.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Tax</span>
                  <span>${liveTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Margin</span>
                  <span>${liveMargin.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-gray-900 pt-2 border-t border-gray-200">
                  <span>Final Total</span>
                  <span className="text-primary-700">${liveTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Timeline (Days)</h3>
            <div className="space-y-3">
              {[
                { label: 'Design', key: 'designDurationDays' },
                { label: 'Procurement', key: 'procurementDurationDays' },
                { label: 'Development', key: 'developmentDurationDays' },
                { label: 'Testing', key: 'testingDurationDays' },
                { label: 'Installation', key: 'installationDurationDays' },
                { label: 'Training', key: 'trainingDurationDays' },
                { label: 'Delivery', key: 'deliveryDurationDays' }
              ].map(field => (
                <div key={field.key} className="flex items-center justify-between">
                  <label className="text-sm text-gray-700 w-1/2">{field.label}</label>
                  <Input
                    type="number"
                    min="0"
                    className="w-24 text-right"
                    value={(formData as any)[field.key]}
                    onChange={(e: any) => setFormData(prev => ({ ...prev, [field.key]: Number(e.target.value) }))}
                    disabled={isReadOnly}
                  />
                </div>
              ))}
              <div className="pt-3 mt-3 border-t border-gray-200 flex justify-between font-medium text-gray-900">
                <span>Total Days</span>
                <span>
                  {formData.designDurationDays + formData.procurementDurationDays + formData.developmentDurationDays + 
                   formData.testingDurationDays + formData.installationDurationDays + formData.trainingDurationDays + 
                   formData.deliveryDurationDays}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

