import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2, Lock } from 'lucide-react';
import { LeadApi } from '../../services/LeadApi';
import { ClientApi } from '../../services/ClientApi';
import type { LeadRequest, LeadStatus, InquirySource } from '../../types/lead';
import type { Client, ClientContact } from '../../types/client';
import { Button } from '../Button';
import { LoadingState, ErrorState } from '../FeedbackStates';
import { FormField, Input, Select, Textarea } from '../Forms';
import { Alert } from '../Alert';
import { Modal } from '../Modal';
import { SectionHeader } from '../SectionHeader';

// ── Helpers ────────────────────────────────────────────────────────────────

function toLocalDatetimeValue(iso: string): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return (
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T` +
      `${pad(d.getHours())}:${pad(d.getMinutes())}`
    );
  } catch {
    return '';
  }
}

function toISOString(localDt: string): string {
  if (!localDt) return '';
  try {
    return new Date(localDt).toISOString();
  } catch {
    return '';
  }
}

function mapApiError(message: string): string {
  if (!message) return 'An unexpected error occurred. Please try again.';
  const lower = message.toLowerCase();
  if (lower.includes('duplicate') || lower.includes('already exists'))
    return 'A lead with similar details already exists. Please review and try again.';
  if (lower.includes('client') && lower.includes('not found'))
    return 'The selected client could not be found. Please choose a valid client.';
  if (lower.includes('contact') && lower.includes('not found'))
    return 'The selected contact is not valid for this client. Please choose again.';
  if (lower.includes('status'))
    return 'The selected status is not valid for this lead.';
  if (lower.includes('meeting') || lower.includes('date'))
    return 'The initial meeting date and time is invalid. Please enter a valid date.';
  return message;
}

// ── Form state ─────────────────────────────────────────────────────────────

interface FormData extends LeadRequest {
  initialMeetingAt: string; // local datetime string for input
}

const initialFormData: FormData = {
  clientId: '',
  contactId: '',
  title: '',
  inquirySource: 'WEBSITE',
  status: 'NEW',
  interestedProduct: '',
  initialRequest: '',
  notes: '',
  initialMeetingAt: '',
};

interface FieldErrors {
  title?: string;
  clientId?: string;
  inquirySource?: string;
  status?: string;
  initialMeetingAt?: string;
}

// ── Main component ─────────────────────────────────────────────────────────

export interface LeadFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  leadId?: string;
}

export const LeadForm: React.FC<LeadFormProps> = ({ isOpen, onClose, onSuccess, leadId }) => {
  const isEditing = !!leadId;

  // Page-level state
  const [pageLoading, setPageLoading] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Options lists
  const [clients, setClients] = useState<Client[]>([]);
  const [contacts, setContacts] = useState<ClientContact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);

  // Form state
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const isDirtyRef = useRef(false);

  // ── Load clients once ────────────────────────────────────────────────────
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await ClientApi.searchClients('', true, 0, 200);
        setClients(data.content || []);
      } catch {
        // Non-blocking; list will be empty but field still shown
      }
    };
    void fetchClients();
  }, []);

  // ── Load existing lead (edit mode) ───────────────────────────────────────
  const loadLead = useCallback(async () => {
    if (!leadId) return;
    setPageLoading(true);
    setPageError(null);
    try {
      const lead = await LeadApi.getLead(leadId);
      setFormData({
        clientId: lead.clientId ?? '',
        contactId: lead.contactId ?? '',
        title: lead.title ?? '',
        inquirySource: lead.inquirySource ?? 'WEBSITE',
        status: lead.status ?? 'NEW',
        interestedProduct: lead.interestedProduct ?? '',
        initialRequest: lead.initialRequest ?? '',
        notes: lead.notes ?? '',
        initialMeetingAt: toLocalDatetimeValue((lead as { initialMeetingAt?: string }).initialMeetingAt ?? ''),
      });
    } catch {
      setPageError('Failed to load lead details. Please try again.');
    } finally {
      setPageLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    if (isOpen) {
      if (isEditing) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void loadLead();
      } else {
        setFormData(initialFormData);
        setFieldErrors({});
        setPageError(null);
        setApiError(null);
        isDirtyRef.current = false;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, leadId, isEditing]);

  // ── Load contacts when client changes ────────────────────────────────────
  useEffect(() => {
    const clientId = formData.clientId;
    let active = true;
    if (!clientId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setContacts([]);
      setLoadingContacts(false);
      return;
    }
    setLoadingContacts(true);
    ClientApi.getClientContacts(clientId)
      .then(data => {
        if (active) setContacts(data);
      })
      .catch(() => {
        if (active) setContacts([]);
      })
      .finally(() => {
        if (active) setLoadingContacts(false);
      });
    return () => { active = false; };
  }, [formData.clientId]);

  // ── Unsaved-changes guard ────────────────────────────────────────────────
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirtyRef.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // ── Field change handler ─────────────────────────────────────────────────
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    isDirtyRef.current = true;

    setFormData(prev => {
      const next = { ...prev, [name]: value };
      // Reset contact when client changes
      if (name === 'clientId' && value !== prev.clientId) {
        next.contactId = '';
      }
      return next;
    });

    // Clear field-level error on change
    if (name in fieldErrors) {
      setFieldErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // ── Validation ───────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const errors: FieldErrors = {};
    if (!formData.title.trim()) errors.title = 'Lead title is required.';
    if (!formData.clientId) errors.clientId = 'Please select a client.';
    if (!formData.inquirySource) errors.inquirySource = 'Inquiry source is required.';
    if (!formData.status) errors.status = 'Status is required.';
    if (formData.initialMeetingAt) {
      const ts = toISOString(formData.initialMeetingAt);
      if (!ts) errors.initialMeetingAt = 'Enter a valid date and time.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) return;

    const payload: LeadRequest = {
      clientId: formData.clientId,
      title: formData.title.trim(),
      inquirySource: formData.inquirySource as InquirySource,
      status: formData.status as LeadStatus,
      contactId: formData.contactId || undefined,
      interestedProduct: formData.interestedProduct || undefined,
      initialRequest: formData.initialRequest || undefined,
      notes: formData.notes || undefined,
      initialMeetingAt: formData.initialMeetingAt
        ? toISOString(formData.initialMeetingAt)
        : undefined,
    };

    try {
      setSaving(true);
      if (isEditing) {
        await LeadApi.updateLead(leadId!, payload);
      } else {
        await LeadApi.createLead(payload);
      }
      isDirtyRef.current = false;
      onSuccess();
    } catch (err) {
      const raw = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? '';
      setApiError(mapApiError(raw));
    } finally {
      setSaving(false);
    }
  };

  // ── Cancel handler (with unsaved-changes warning) ────────────────────────
  const handleCancel = () => {
    if (isDirtyRef.current) {
      if (!window.confirm('You have unsaved changes. Leave anyway?')) return;
    }
    onClose();
  };

  // ── Render: form ─────────────────────────────────────────────────────────
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={isEditing ? 'Edit Lead' : 'Create Lead'}
      maxWidth="760px"
    >
      {pageLoading ? (
        <LoadingState message="Loading lead data…" />
      ) : pageError ? (
        <ErrorState
          title="Could not load lead"
          message={pageError}
          onRetry={isEditing ? loadLead : undefined}
        />
      ) : (
        <>
          {apiError && (
            <Alert variant="error" style={{ marginBottom: '1rem' }}>{apiError}</Alert>
          )}

          <form
            onSubmit={handleSubmit}
            noValidate
            aria-label={isEditing ? 'Edit Lead form' : 'Create Lead form'}
            style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}
          >
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingRight: '0.5rem' }}>
              {/* ── Section: Lead Information ── */}
              <div style={{ marginBottom: '0.75rem' }}>
                <SectionHeader title="Lead Information" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', columnGap: '1rem', rowGap: '0.5rem', marginBottom: '1.25rem' }}>
                {/* Title — full width */}
                <div style={{ gridColumn: '1 / -1' }}>
              <FormField label="Lead Title" required error={fieldErrors.title}>
                <Input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Needs a new e-commerce website"
                  required
                  disabled={saving}
                  maxLength={255}
                  error={fieldErrors.title ? "true" : undefined}
                />
              </FormField>
            </div>

            {/* Inquiry Source */}
            <FormField label="Inquiry Source" required error={fieldErrors.inquirySource}>
              <Select
                name="inquirySource"
                value={formData.inquirySource}
                onChange={handleChange}
                required
                disabled={saving}
                error={fieldErrors.inquirySource ? "true" : undefined}
              >
                <option value="WEBSITE">Website</option>
                <option value="REFERRAL">Referral</option>
                <option value="COLD_CALL">Cold Call</option>
                <option value="EVENT">Event</option>
                <option value="OTHER">Other</option>
              </Select>
            </FormField>

            {/* Status */}
            <FormField label="Lead Status" required error={fieldErrors.status}>
              <Select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                disabled={saving}
                error={fieldErrors.status ? "true" : undefined}
              >
                <option value="NEW">New</option>
                <option value="CONTACTED">Contacted</option>
                <option value="QUALIFIED">Qualified</option>
                <option value="PROPOSAL_SENT">Proposal Sent</option>
                <option value="CLOSED_WON">Closed Won</option>
                <option value="CLOSED_LOST">Closed Lost</option>
              </Select>
            </FormField>
          </div>

          {/* ── Section: Client Information ── */}
          <div style={{ marginTop: '0.5rem', marginBottom: '0.75rem' }}>
              <SectionHeader title="Client Information" />
            </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', columnGap: '1rem', rowGap: '0.5rem', marginBottom: '1.25rem' }}>
            {/* Client */}
            <FormField 
              label="Client" 
              required 
              error={fieldErrors.clientId}
              helpText={isEditing ? 'The client cannot be changed after the lead is created.' : undefined}
            >
              <div className="relative">
                <Select
                  name="clientId"
                  value={formData.clientId}
                  onChange={handleChange}
                  required
                  disabled={saving || isEditing}
                  error={fieldErrors.clientId ? "true" : undefined}
                >
                  <option value="">— Select a client —</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                  {isEditing && formData.clientId && !clients.find(c => c.id === formData.clientId) && (
                    <option value={formData.clientId}>Current client</option>
                  )}
                </Select>
                {isEditing && (
                  <Lock
                    size={14}
                    className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                )}
              </div>
            </FormField>

            {/* Client Contact */}
            <FormField 
              label="Client Contact"
              helpText={
                !formData.clientId
                  ? 'Select a client first to load contacts.'
                  : loadingContacts
                  ? 'Loading contacts…'
                  : contacts.length === 0
                  ? 'No contacts available for this client.'
                  : undefined
              }
            >
              <div className="relative">
                <Select
                  name="contactId"
                  value={formData.contactId ?? ''}
                  onChange={handleChange}
                  disabled={saving || !formData.clientId || loadingContacts}
                >
                  <option value="">
                    {loadingContacts
                      ? 'Loading contacts…'
                      : !formData.clientId
                      ? 'Select a client first'
                      : contacts.length === 0
                      ? 'No contacts available'
                      : '— No contact (optional) —'}
                  </option>
                  {contacts.map(contact => (
                    <option key={contact.id} value={contact.id}>
                      {contact.firstName} {contact.lastName}
                      {contact.primary ? ' (Primary)' : ''}
                    </option>
                  ))}
                </Select>
                {loadingContacts && (
                  <Loader2
                    size={14}
                    className="absolute right-8 top-1/2 -translate-y-1/2 animate-spin text-gray-400 pointer-events-none"
                  />
                )}
              </div>
            </FormField>
          </div>
              {/* ── Section: Inquiry Details ── */}
              <div style={{ marginTop: '0.5rem', marginBottom: '0.75rem' }}>
                <SectionHeader title="Inquiry Details" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', columnGap: '1rem', rowGap: '0.5rem', marginBottom: '1.25rem' }}>
            {/* Interested Product */}
            <FormField 
              label="Interested Product / Service"
              helpText="Optional — the product or service the client expressed interest in."
            >
              <Input
                type="text"
                name="interestedProduct"
                value={formData.interestedProduct ?? ''}
                onChange={handleChange}
                placeholder="e.g. E-commerce Platform"
                disabled={saving}
                maxLength={255}
              />
            </FormField>

            {/* Initial Meeting Date & Time */}
            <FormField 
              label="Initial Meeting Date and Time"
              error={fieldErrors.initialMeetingAt}
              helpText="Used to calculate the project brief deadline (meeting time + 24 hours)."
            >
              <Input
                type="datetime-local"
                name="initialMeetingAt"
                value={formData.initialMeetingAt}
                onChange={handleChange}
                disabled={saving}
                error={fieldErrors.initialMeetingAt ? "true" : undefined}
              />
            </FormField>

            {/* Initial Request — full width */}
            <div style={{ gridColumn: '1 / -1' }}>
              <FormField 
                label="Initial Request"
                helpText="What the client initially requested or described."
              >
                <Textarea
                  name="initialRequest"
                  value={formData.initialRequest ?? ''}
                  onChange={handleChange}
                  placeholder="Describe what the client requested…"
                  rows={4}
                  disabled={saving}
                />
              </FormField>
            </div>

            {/* Notes — full width */}
            <div style={{ gridColumn: '1 / -1' }}>
              <FormField 
                label="Notes"
                helpText="Internal notes or observations about this lead."
              >
                <Textarea
                  name="notes"
                  value={formData.notes ?? ''}
                  onChange={handleChange}
                  placeholder="Add any additional notes…"
                  rows={3}
                  disabled={saving}
                />
              </FormField>
            </div>
            </div>
            </div>

            {/* ── Form actions ── */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', flexShrink: 0 }}>
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={saving}
                disabled={saving}
              >
                {saving
                  ? 'Saving…'
                  : isEditing
                  ? 'Save Changes'
                  : 'Create Lead'}
              </Button>
            </div>
          </form>
        </>
      )}
    </Modal>
  );
};
