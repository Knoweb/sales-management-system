import React, { useState, useEffect } from 'react';
import { ClientApi } from '../../services/ClientApi';
import type { ClientContact, ClientContactRequest } from '../../types/client';
import { Button } from '../Button';
import { Input } from '../Forms';
import { ErrorState } from '../FeedbackStates';
import { X } from 'lucide-react';

interface ContactModalProps {
  clientId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: ClientContact;
}

export const ContactModal: React.FC<ContactModalProps> = ({ clientId, isOpen, onClose, onSuccess, initialData }) => {
  const [formData, setFormData] = useState<ClientContactRequest>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: '',
    primary: false
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        firstName: initialData.firstName,
        lastName: initialData.lastName,
        email: initialData.email || '',
        phone: initialData.phone || '',
        jobTitle: initialData.jobTitle || '',
        primary: initialData.primary
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        jobTitle: '',
        primary: false
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (initialData?.id) {
        await ClientApi.updateContact(clientId, initialData.id, formData);
      } else {
        await ClientApi.addContact(clientId, formData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error?.response?.data?.message || 'Failed to save contact');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {initialData ? 'Edit Contact' : 'Add Contact'}
          </h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {error && <ErrorState message={error} />}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input
              label="First Name *"
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <Input
              label="Last Name *"
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <Input
            label="Job Title"
            type="text"
            name="jobTitle"
            value={formData.jobTitle}
            onChange={handleChange}
            disabled={loading}
          />

          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
          />

          <Input
            label="Phone"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            disabled={loading}
          />

          <div className="form-group">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                id="primary"
                name="primary"
                checked={formData.primary}
                onChange={handleChange}
                disabled={loading}
              />
              <span className="form-label" style={{ marginBottom: 0 }}>Set as Primary Contact</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" variant="primary" isLoading={loading}>Save Contact</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
