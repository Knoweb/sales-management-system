import React, { useState, useEffect } from 'react';
import { convertLeadToOpportunity } from '../api/opportunityApi';
import { apiClient as api } from '../services/Api';
import { Input, Select } from './Forms';
import { Button } from './Button';
import { ErrorState } from './FeedbackStates';
import { X } from 'lucide-react';

interface LeadConversionModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string;
  leadTitle: string;
  onSuccess: (opportunityId: string) => void;
}

const LeadConversionModal: React.FC<LeadConversionModalProps> = ({ isOpen, onClose, leadId, leadTitle, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: leadTitle,
    estimatedValue: 0,
    currency: 'USD',
    expectedCloseDate: '',
    productCategoryId: ''
  });

  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Fetch categories
      api.get('/product-categories').then((res: { data: { id: string, name: string }[] }) => setCategories(res.data)).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'estimatedValue' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const opp = await convertLeadToOpportunity(leadId, {
        ...formData,
        expectedCloseDate: new Date(formData.expectedCloseDate).toISOString(),
        productCategoryId: formData.productCategoryId
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Convert Lead to Opportunity
          </h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {error && <ErrorState message={error} />}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Opportunity Title *"
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
          />
          
          <Select
            label="Product Category *"
            name="productCategoryId"
            required
            value={formData.productCategoryId}
            onChange={handleChange}
          >
            <option value="">Select Category</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
          
          <Input
            label="Estimated Value *"
            type="number"
            name="estimatedValue"
            required
            value={formData.estimatedValue}
            onChange={handleChange}
          />

          <Input
            label="Expected Close Date *"
            type="date"
            name="expectedCloseDate"
            required
            value={formData.expectedCloseDate}
            onChange={handleChange}
          />

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={loading}>
              Convert
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadConversionModal;
