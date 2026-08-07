import React, { useState } from 'react';
import { ClientApi } from '../../services/ClientApi';
import type { ClientRequest, Client } from '../../types/client';
import { Button } from '../Button';
import { FormField, Input, Select, Textarea } from '../Forms';
import { Alert } from '../Alert';

interface ClientFormProps {
  initialData?: Client;
  onSuccess: (client: Client) => void;
  onCancel: () => void;
}

export const ClientForm: React.FC<ClientFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<ClientRequest>({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    registrationNumber: initialData?.registrationNumber || '',
    industry: initialData?.industry || '',
    address: initialData?.address || '',
    clientType: initialData?.clientType || 'COMPANY'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ title?: string, message: string } | string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
  const [warning, setWarning] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent, ignoreDuplicates = false) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setWarning(null);

    try {
      setFieldErrors({});

      const payload: ClientRequest = {
        ...formData,
        registrationNumber: formData.registrationNumber || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        industry: formData.industry || undefined,
        address: formData.address || undefined,
      };

      // Duplicate check step
      if (!ignoreDuplicates) {
        const checkResult = await ClientApi.checkClientDuplicates(payload, initialData?.id);

        if (checkResult.hasConflict) {
          if (checkResult.message.includes('inactive')) {
            setError({
              title: 'Inactive Client Already Exists',
              message: 'This client already exists but is inactive. Reactivate the existing client instead of creating a duplicate record.'
            });
            if (checkResult.field === 'REGISTRATION_NUMBER') setFieldErrors({ registrationNumber: true });
          } else if (checkResult.field === 'REGISTRATION_NUMBER') {
            setError({
              title: 'Registration Number Already Used',
              message: 'A client with this registration number already exists. Please enter a different registration number.'
            });
            setFieldErrors({ registrationNumber: true });
          } else {
            setError(checkResult.message);
          }
          setLoading(false);
          return;
        }

        if (checkResult.hasWarning) {
          setWarning(checkResult.message);
          setLoading(false);
          return;
        }
      }

      let result: Client;
      if (initialData?.id) {
        result = await ClientApi.updateClient(initialData.id, payload, ignoreDuplicates);
      } else {
        result = await ClientApi.createClient(payload, ignoreDuplicates);
      }

      onSuccess(result);
    } catch (err) {
      const errObj = err as { response?: { status?: number; data?: { message?: string } } };
      console.error('Failed to save client', errObj);
      const status = errObj?.response?.status;
      const message = errObj?.response?.data?.message || 'Failed to save client';

      if (status === 409) {
        if (message.includes('inactive')) {
          setError({
            title: 'Inactive Client Already Exists',
            message: 'This client already exists but is inactive. Reactivate the existing client instead of creating a duplicate record.'
          });
          if (message.toLowerCase().includes('registration')) setFieldErrors({ registrationNumber: true });
        } else if (message.toLowerCase().includes('registration number')) {
          setError({
            title: 'Registration Number Already Used',
            message: 'A client with this registration number already exists. Please enter a different registration number.'
          });
          setFieldErrors({ registrationNumber: true });
        } else {
          setError(message);
        }
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, false)}>
      <div style={{ maxHeight: '65vh', overflowY: 'auto', paddingRight: '0.5rem' }} className="space-y-8">
      {error && (
        <Alert variant="error" style={{ marginBottom: '1rem' }}>
          {typeof error === 'object' ? error.message : error}
        </Alert>
      )}

      {warning && (
        <Alert variant="warning" style={{ marginBottom: '1rem' }}>
          {warning}
        </Alert>
      )}

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2">Client Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Client Type" required>
            <Select
              name="clientType"
              value={formData.clientType}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="COMPANY">Company</option>
              <option value="INDIVIDUAL">Individual</option>
              <option value="GOVERNMENT">Government</option>
              <option value="NON_PROFIT">Non-Profit</option>
              <option value="OTHER">Other</option>
            </Select>
          </FormField>

          <FormField label="Name" required>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              maxLength={100}
              disabled={loading}
              placeholder="Company or individual name"
            />
          </FormField>

          <FormField 
            label="Registration Number"
            error={fieldErrors.registrationNumber}
          >
            <Input
              type="text"
              name="registrationNumber"
              value={formData.registrationNumber}
              onChange={handleChange}
              disabled={loading}
              maxLength={50}
              placeholder="Business/Tax ID"
              error={fieldErrors.registrationNumber ? "true" : undefined}
            />
          </FormField>

          <FormField label="Industry">
            <Input
              type="text"
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              disabled={loading}
              maxLength={50}
              placeholder="e.g. Technology"
            />
          </FormField>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Email">
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              maxLength={100}
              placeholder="client@example.com"
            />
          </FormField>

          <FormField label="Phone">
            <Input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={loading}
              maxLength={50}
              placeholder="+1 555-1234"
            />
          </FormField>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2">Address</h3>
        <FormField label="Full Address">
          <Textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            disabled={loading}
            maxLength={255}
            rows={3}
            placeholder="Full address"
          />
        </FormField>
      </div>

      {warning && (
        <div className="flex justify-end gap-4 mt-4">
          <Button type="button" variant="outline" onClick={() => setWarning(null)}>Cancel</Button>
          <Button type="button" variant="primary" onClick={(e) => handleSubmit(e, true)}>Proceed Anyway</Button>
        </div>
      )}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '1rem',
          borderTop: '1px solid #e2e8f0',
          paddingTop: '1rem',
          marginTop: '0.5rem'
        }}
      >
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
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
          isLoading={loading}
          style={{
            minWidth: '130px',
            height: '42px',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            border: '1px solid #2563eb',
            borderRadius: '9px',
            fontSize: '14px',
            fontWeight: 600,
            boxShadow: '0 4px 10px rgba(37, 99, 235, 0.2)',
          }}
        >
          {initialData ? 'Update Client' : 'Create Client'}
        </Button>
      </div>
    </form>
  );
};
