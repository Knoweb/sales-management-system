import React, { useState, useEffect } from 'react';
import { ClientApi } from '../../services/ClientApi';
import type { ClientContact, ClientContactRequest } from '../../types/client';
import { Button } from '../Button';
import { FormField, Input, Checkbox } from '../Forms';
import { Modal } from '../Modal';
import { Alert } from '../Alert';

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Contact' : 'Add Contact'}
      maxWidth="600px"
    >
      <div className="p-6">
        {error && (
          <Alert variant="error" style={{ marginBottom: '1rem' }}>{error}</Alert>
        )}

        <form id="contact-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="First Name" required>
              <Input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </FormField>
            <FormField label="Last Name" required>
              <Input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </FormField>
          </div>

          <FormField label="Job Title">
            <Input
              type="text"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleChange}
              disabled={loading}
            />
          </FormField>

          <FormField label="Email">
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />
          </FormField>

          <FormField label="Phone">
            <Input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={loading}
            />
          </FormField>

          <FormField>
            <Checkbox
              name="primary"
              label="Set as Primary Contact"
              checked={formData.primary}
              onChange={handleChange}
              disabled={loading}
            />
          </FormField>

          <div className="flex justify-end gap-3 mt-8">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={loading}>
              Save Contact
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
