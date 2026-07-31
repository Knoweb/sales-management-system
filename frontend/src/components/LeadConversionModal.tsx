import React, { useState, useEffect } from 'react';
import { convertLeadToOpportunity } from '../api/opportunityApi';
import { apiClient as api } from '../services/Api';
import { Input, Select } from './Forms';
import { Button } from './Button';
import { ErrorState } from './FeedbackStates';
import { X } from 'lucide-react';
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

  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    if (isOpen) {
      api.get('/product-categories').then((res: { data: { id: string, name: string }[] }) => setCategories(res.data)).catch(console.error);
      EmployeeApi.search(undefined, undefined, 'ACTIVE', undefined, undefined, 0, 100).then(res => setEmployees(res.content || [])).catch(console.error);
      
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(prev => ({
        ...prev,
        title: leadTitle,
        assignedSalesOfficerId: assignedTo || ''
      }));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormErrors({});
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError(null);
    }
  }, [isOpen, leadTitle, assignedTo]);

  if (!isOpen) return null;

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
      errors.title = 'Opportunity Title is required';
      valid = false;
    }
    if (!formData.productCategoryId) {
      errors.productCategoryId = 'Product Category is required';
      valid = false;
    }
    if (!formData.assignedSalesOfficerId) {
      errors.assignedSalesOfficerId = 'Assigned Sales Officer is required';
      valid = false;
    }
    if (formData.estimatedValue <= 0) {
      errors.estimatedValue = 'Estimated Value must be greater than 0';
      valid = false;
    }
    if (!formData.expectedCloseDate) {
      errors.expectedCloseDate = 'Expected Close Date is required';
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
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">
            Convert Lead to Opportunity
          </h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {error && <ErrorState message={error} />}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Opportunity Title"
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            error={formErrors.title}
          />
          
          <Select
            label="Product Category"
            name="productCategoryId"
            required
            value={formData.productCategoryId}
            onChange={handleChange}
            error={formErrors.productCategoryId}
          >
            <option value="">Select Category</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
          
          <Select
            label="Assigned Sales Officer"
            name="assignedSalesOfficerId"
            required
            value={formData.assignedSalesOfficerId}
            onChange={handleChange}
            error={formErrors.assignedSalesOfficerId}
          >
            <option value="">Select Sales Officer</option>
            {employees.map(e => (
              <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
            ))}
          </Select>
          
          <Input
            label="Estimated Value"
            type="number"
            name="estimatedValue"
            required
            value={formData.estimatedValue}
            onChange={handleChange}
            error={formErrors.estimatedValue}
          />

          <Input
            label="Expected Close Date"
            type="date"
            name="expectedCloseDate"
            required
            value={formData.expectedCloseDate}
            onChange={handleChange}
            error={formErrors.expectedCloseDate}
          />

          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading} isLoading={loading}>
              {loading ? 'Converting...' : 'Convert'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadConversionModal;
