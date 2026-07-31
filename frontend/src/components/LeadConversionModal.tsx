import React, { useState, useEffect } from 'react';
import { convertLeadToOpportunity } from '../api/opportunityApi';
import { ProductCategoryApi, type ProductCategory } from '../api/productCategoryApi';
import { FormField, Input, Select } from './Forms';
import { Button } from './Button';
import { Modal } from './Modal';
import { Alert } from './Alert';
import { EmployeeApi } from '../services/EmployeeApi';
import type { Employee } from '../types/employee';

interface LeadConversionModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string;
  leadTitle: string;
  assignedTo?: string | null;
  onSuccess: (opportunityId: string) => void;
}

const LeadConversionModal: React.FC<LeadConversionModalProps> = ({ isOpen, onClose, leadId, leadTitle, assignedTo, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const [formData, setFormData] = useState({
    title: leadTitle,
    estimatedValue: 0,
    currency: 'USD',
    expectedCloseDate: '',
    productCategoryId: '',
    assignedSalesOfficerId: assignedTo || ''
  });

  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    if (isOpen) {
      ProductCategoryApi.getActiveCategories().then(res => setCategories(res)).catch(console.error);
      EmployeeApi.search(undefined, undefined, 'ACTIVE', undefined, undefined, 0, 100).then(res => setEmployees(res.content || [])).catch(console.error);
      
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(prev => ({
        ...prev,
        title: leadTitle,
        assignedSalesOfficerId: assignedTo || ''
      }));
      setFormErrors({});
      setError(null);
    }
  }, [isOpen, leadTitle, assignedTo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'estimatedValue' ? parseFloat(value) || 0 : value,
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    let valid = true;
    const errors: { [key: string]: string } = {};
    if (!formData.title.trim()) {
      errors.title = 'Opportunity title is required';
      valid = false;
    }
    if (!formData.productCategoryId) {
      errors.productCategoryId = 'Product category is required';
      valid = false;
    }
    if (!formData.assignedSalesOfficerId) {
      errors.assignedSalesOfficerId = 'Assigned sales officer is required';
      valid = false;
    }
    if (formData.estimatedValue <= 0) {
      errors.estimatedValue = 'Estimated value must be greater than 0';
      valid = false;
    }
    if (!formData.expectedCloseDate) {
      errors.expectedCloseDate = 'Expected close date is required';
      valid = false;
    }
    setFormErrors(errors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      setError(null);
      const opp = await convertLeadToOpportunity(leadId, {
        ...formData,
        expectedCloseDate: new Date(formData.expectedCloseDate).toISOString(),
        productCategoryId: formData.productCategoryId,
        assignedSalesOfficerId: formData.assignedSalesOfficerId
      });
      onSuccess(opp.id);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Failed to convert lead');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Convert Lead to Opportunity"
      maxWidth="600px"
    >
      <div className="p-6">
        {error && <Alert variant="error" style={{ marginBottom: '1.5rem' }}>{error}</Alert>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Opportunity Title" required error={formErrors.title}>
            <Input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              disabled={loading}
              placeholder="e.g. Acme Corp Enterprise Deal"
            />
          </FormField>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Product Category" required error={formErrors.productCategoryId}>
              <Select
                name="productCategoryId"
                required
                value={formData.productCategoryId}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">Select Category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </FormField>
            
            <FormField label="Assigned Sales Officer" required error={formErrors.assignedSalesOfficerId}>
              <Select
                name="assignedSalesOfficerId"
                required
                value={formData.assignedSalesOfficerId}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">Select Sales Officer</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                ))}
              </Select>
            </FormField>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Estimated Value (USD)" required error={formErrors.estimatedValue}>
              <Input
                type="number"
                name="estimatedValue"
                required
                min="0.01"
                step="0.01"
                value={formData.estimatedValue}
                onChange={handleChange}
                disabled={loading}
              />
            </FormField>

            <FormField label="Expected Close Date" required error={formErrors.expectedCloseDate}>
              <Input
                type="date"
                name="expectedCloseDate"
                required
                value={formData.expectedCloseDate}
                onChange={handleChange}
                disabled={loading}
              />
            </FormField>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading} isLoading={loading}>
              Convert to Opportunity
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default LeadConversionModal;
