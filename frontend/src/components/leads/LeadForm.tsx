import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LeadApi } from '../../services/LeadApi';
import { ClientApi } from '../../services/ClientApi';
import type { LeadRequest } from '../../types/lead';
import type { Client, ClientContact } from '../../types/client';
import { Button } from '../Button';

export const LeadForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [contacts, setContacts] = useState<ClientContact[]>([]);

  const [formData, setFormData] = useState<LeadRequest>({
    clientId: '',
    contactId: '',
    title: '',
    inquirySource: 'WEBSITE',
    status: 'NEW',
    interestedProduct: '',
    initialRequest: '',
    notes: ''
  });

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await ClientApi.searchClients('', true, 0, 100);
        setClients(data.content || []);
      } catch (err) {
        console.error('Failed to load clients', err);
      }
    };

    void fetchClients();

    if (isEditing) {
      const fetchLead = async () => {
        try {
          const lead = await LeadApi.getLead(id);
          setFormData({
            clientId: lead.clientId,
            contactId: lead.contactId || '',
            title: lead.title,
            inquirySource: lead.inquirySource,
            status: lead.status,
            interestedProduct: lead.interestedProduct || '',
            initialRequest: lead.initialRequest || '',
            notes: lead.notes || ''
          });
        } catch (err) {
          setError('Failed to load lead details');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      void fetchLead();
    }
  }, [id, isEditing]);

  useEffect(() => {
    let mounted = true;
    if (formData.clientId) {
      ClientApi.getClientContacts(formData.clientId)
        .then(data => {
          if (mounted) setContacts(data);
        })
        .catch(err => console.error('Failed to load contacts', err));
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setContacts([]);
    }
    return () => { mounted = false; };
  }, [formData.clientId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      if (isEditing) {
        await LeadApi.updateLead(id, formData);
      } else {
        await LeadApi.createLead(formData);
      }
      navigate('/leads');
    } catch (err) {
      console.error('Failed to save lead', err);
      const errorResponse = err as { response?: { data?: { message?: string } } };
      setError(errorResponse?.response?.data?.message || 'Failed to save lead. Please check the form data.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="card"><div className="card-body">Loading lead data...</div></div>;
  }

  return (
    <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="card-header">
        <h2 className="card-title">{isEditing ? 'Edit Lead' : 'Create New Lead'}</h2>
      </div>
      <div className="card-body">
        {error && (
          <div className="error-message" style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: 'var(--error-bg)', color: 'var(--error)', borderRadius: 'var(--radius-md)' }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="title" className="form-label">Lead Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              className="form-control"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Needs new CMS system"
            />
          </div>

          <div className="form-group">
            <label htmlFor="clientId" className="form-label">Client *</label>
            <select
              id="clientId"
              name="clientId"
              className="form-control"
              required
              value={formData.clientId}
              onChange={handleChange}
              disabled={isEditing}
            >
              <option value="">Select a Client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="contactId" className="form-label">Client Contact</label>
            <select
              id="contactId"
              name="contactId"
              className="form-control"
              value={formData.contactId || ''}
              onChange={handleChange}
            >
              <option value="">No Contact Selected</option>
              {contacts.map(contact => (
                <option key={contact.id} value={contact.id}>
                  {contact.firstName} {contact.lastName} {contact.primary ? '(Primary)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="inquirySource" className="form-label">Inquiry Source *</label>
            <select
              id="inquirySource"
              name="inquirySource"
              className="form-control"
              required
              value={formData.inquirySource}
              onChange={handleChange}
            >
              <option value="WEBSITE">Website</option>
              <option value="REFERRAL">Referral</option>
              <option value="COLD_CALL">Cold Call</option>
              <option value="EVENT">Event</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="status" className="form-label">Status *</label>
            <select
              id="status"
              name="status"
              className="form-control"
              required
              value={formData.status}
              onChange={handleChange}
            >
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="PROPOSAL_SENT">Proposal Sent</option>
              <option value="CLOSED_WON">Closed Won</option>
              <option value="CLOSED_LOST">Closed Lost</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="interestedProduct" className="form-label">Interested Product</label>
            <input
              type="text"
              id="interestedProduct"
              name="interestedProduct"
              className="form-control"
              value={formData.interestedProduct}
              onChange={handleChange}
            />
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="initialRequest" className="form-label">Initial Request</label>
            <textarea
              id="initialRequest"
              name="initialRequest"
              className="form-control"
              rows={3}
              value={formData.initialRequest}
              onChange={handleChange}
            />
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="notes" className="form-label">Notes</label>
            <textarea
              id="notes"
              name="notes"
              className="form-control"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
            />
          </div>

          <div className="form-actions" style={{ gridColumn: '1 / -1' }}>
            <Button type="button" variant="secondary" onClick={() => navigate('/leads')} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Lead'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
