import React, { useState } from 'react';
import { ClientApi } from '../../services/ClientApi';
import type { ClientRequest, Client } from '../../types/client';
import { Button } from '../Button';
import { AlertCircle } from 'lucide-react';

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
      // Duplicate check step
      if (!ignoreDuplicates) {
        const checkResult = await ClientApi.checkClientDuplicates(formData, initialData?.id);

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
        result = await ClientApi.updateClient(initialData.id, formData, ignoreDuplicates);
      } else {
        result = await ClientApi.createClient(formData, ignoreDuplicates);
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
    <form onSubmit={(e) => handleSubmit(e, false)} className="client-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {error && (
        <div style={{ padding: '0.75rem', backgroundColor: 'var(--error-bg)', color: 'var(--error)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
          <AlertCircle size={16} style={{ marginTop: '0.125rem', flexShrink: 0 }} />
          <div>
            {typeof error === 'object' && error.title && (
              <strong style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9375rem' }}>{error.title}</strong>
            )}
            <span style={{ fontSize: '0.875rem' }}>{typeof error === 'object' ? error.message : error}</span>
          </div>
        </div>
      )}

      {warning && (
        <div style={{ padding: '0.75rem', backgroundColor: 'var(--warning-bg)', color: 'var(--warning)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} />
            <strong>Warning:</strong> {warning}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <Button type="button" variant="ghost" onClick={() => setWarning(null)}>Cancel</Button>
            <Button type="button" variant="primary" onClick={(e) => handleSubmit(e, true)}>Proceed Anyway</Button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Client Type *</label>
          <select
            name="clientType"
            value={formData.clientType}
            onChange={handleChange}
            required
            disabled={loading}
            style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-card)' }}
          >
            <option value="COMPANY">Company</option>
            <option value="INDIVIDUAL">Individual</option>
            <option value="GOVERNMENT">Government</option>
            <option value="NON_PROFIT">Non-Profit</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            maxLength={100}
            disabled={loading}
            style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
            placeholder="Company or individual name"
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            maxLength={100}
            style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
            placeholder="client@example.com"
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            disabled={loading}
            maxLength={50}
            style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
            placeholder="+1 555-1234"
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Registration Number</label>
          <input
            type="text"
            name="registrationNumber"
            value={formData.registrationNumber}
            onChange={handleChange}
            disabled={loading}
            maxLength={50}
            style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-md)', border: fieldErrors.registrationNumber ? '1px solid var(--error)' : '1px solid var(--border)' }}
            placeholder="Business/Tax ID"
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Industry</label>
          <input
            type="text"
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            disabled={loading}
            maxLength={50}
            style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
            placeholder="e.g. Technology"
          />
        </div>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Address</label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          disabled={loading}
          maxLength={255}
          style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', minHeight: '80px' }}
          placeholder="Full address"
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={loading}>
          {initialData ? 'Update Client' : 'Create Client'}
        </Button>
      </div>
    </form>
  );
};
