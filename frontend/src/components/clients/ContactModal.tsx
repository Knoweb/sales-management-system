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
      onClose={() => !loading && onClose()}
      title={initialData ? 'Edit Contact' : 'Add Contact'}
    >
      {error && (
        <Alert variant="error" style={{ marginBottom: '1.5rem' }}>
          {error}
        </Alert>
      )}

      <form id="contact-form" onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '0rem' }}>
          <FormField label="First Name" required id="firstName">
            <Input
              id="firstName"
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </FormField>
          <FormField label="Last Name" required id="lastName">
            <Input
              id="lastName"
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </FormField>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <FormField label="Job Title" id="jobTitle">
            <Input
              id="jobTitle"
              type="text"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleChange}
              disabled={loading}
            />
          </FormField>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <FormField label="Email" id="email">
            <Input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />
          </FormField>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <FormField label="Phone" id="phone">
            <Input
              id="phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={loading}
            />
          </FormField>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <Checkbox
            id="primary"
            name="primary"
            label="Set as Primary Contact"
            checked={formData.primary}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onClose} 
            disabled={loading}
            style={{
              minWidth: '110px',
              height: '42px',
              backgroundColor: 'var(--color-surface-secondary)',
              color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-border-strong)',
              borderRadius: '9px',
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={loading}>
            Save Contact
          </Button>
        </div>
      </form>
    </Modal>
  );
};

