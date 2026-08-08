import React, { useState, useEffect } from 'react';
import { getOpportunity, updateOpportunity } from '../../api/opportunityApi';
import { ProductCategoryApi, type ProductCategory } from '../../api/productCategoryApi';
import { EmployeeApi } from '../../services/EmployeeApi';
import type { Employee } from '../../types/employee';
import { FormField, Input, Select } from '../Forms';
import { Button } from '../Button';
import { Modal } from '../Modal';
import { Alert } from '../Alert';

interface EditOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunityId: string;
  onSuccess: () => void;
}

const EditOpportunityModal: React.FC<EditOpportunityModalProps> = ({ isOpen, onClose, opportunityId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const [formData, setFormData] = useState({
    title: '',
    estimatedValue: 0,
    expectedCloseDate: '',
    productCategoryId: '',
    assignedSalesOfficerId: ''
  });

  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    let isMounted = true;
    if (isOpen && opportunityId) {
      setInitialLoading(true);
      setError(null);
      setFormErrors({});

      Promise.all([
        ProductCategoryApi.getActiveCategories(),
        EmployeeApi.search(undefined, undefined, 'ACTIVE', undefined, undefined, 0, 100),
        getOpportunity(opportunityId)
      ])
      .then(([cats, emps, opp]) => {
        if (!isMounted) return;
        setCategories(cats);
        setEmployees(emps.content || []);
        
        setFormData({
          title: opp.title || '',
          estimatedValue: opp.estimatedValue || 0,
          expectedCloseDate: opp.expectedCloseDate ? new Date(opp.expectedCloseDate).toISOString().split('T')[0] : '',
          productCategoryId: opp.productCategoryId || '',
          assignedSalesOfficerId: opp.assignedSalesOfficerId || ''
        });
      })
      .catch(err => {
        if (!isMounted) return;
        console.error(err);
        setError('Failed to load opportunity data.');
      })
      .finally(() => {
        if (isMounted) setInitialLoading(false);
      });
    }
    return () => { isMounted = false; };
  }, [isOpen, opportunityId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
    if (formData.estimatedValue < 0) {
      errors.estimatedValue = 'Estimated value must be greater than or equal to 0';
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
      await updateOpportunity(opportunityId, {
        title: formData.title,
        productCategoryId: formData.productCategoryId,
        assignedSalesOfficerId: formData.assignedSalesOfficerId,
        estimatedValue: formData.estimatedValue,
        expectedCloseDate: formData.expectedCloseDate
      });
      onSuccess();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Failed to update opportunity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Sales Opportunity"
      maxWidth="600px"
    >
      {initialLoading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
          Loading opportunity details...
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '1rem' }}>
          {error && <Alert variant="error" style={{ marginBottom: '0.5rem' }}>{error}</Alert>}
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
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
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
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <FormField label="Estimated Value (LKR)" required error={formErrors.estimatedValue}>
              <Input
                type="number"
                name="estimatedValue"
                required
                min="0"
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
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: '1rem', 
          borderTop: '1px solid var(--color-border)',
          paddingTop: '1.25rem',
          marginTop: '0.5rem'
        }}>
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onClose} 
            disabled={loading}
            style={{
              minWidth: '110px',
              height: '42px',
              backgroundColor: '#f1f5f9',
              color: '#475569',
              border: '1px solid #cbd5e1',
              borderRadius: '9px',
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            disabled={loading} 
            isLoading={loading}
            style={{
              minWidth: '110px',
              height: '42px',
              borderRadius: '9px',
              fontWeight: 600,
            }}
          >
            Save Changes
          </Button>
        </div>
      </form>
      )}
    </Modal>
  );
};

export default EditOpportunityModal;
