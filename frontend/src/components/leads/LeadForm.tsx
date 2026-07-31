import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, Loader2, Info, Lock } from 'lucide-react';
import { LeadApi } from '../../services/LeadApi';
import { ClientApi } from '../../services/ClientApi';
import type { LeadRequest, LeadStatus, InquirySource } from '../../types/lead';
import type { Client, ClientContact } from '../../types/client';
import { Button } from '../Button';
import { LoadingState, ErrorState } from '../FeedbackStates';

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

// ── Reusable field wrapper ─────────────────────────────────────────────────

interface FieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  help?: string;
  children: React.ReactNode;
  className?: string;
}

const Field: React.FC<FieldProps> = ({ id, label, required, error, help, children, className = '' }) => (
  <div className={`form-group ${className}`} style={{ marginBottom: 0 }}>
    <label htmlFor={id} className="form-label" id={`${id}-label`}>
      {label}
      {required && <span className="form-required" aria-hidden="true"> *</span>}
    </label>
    {children}
    {error && (
      <p className="form-error" id={`${id}-error`} role="alert">
        <AlertCircle size={12} aria-hidden="true" />
        {error}
      </p>
    )}
    {help && !error && (
      <p className="form-help" id={`${id}-help`}>
        <Info size={12} style={{ display: 'inline', marginRight: 3 }} aria-hidden="true" />
        {help}
      </p>
    )}
  </div>
);

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

export const LeadForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();

  // Page-level state
  const [pageLoading, setPageLoading] = useState(isEditing);
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
    if (!id) return;
    setPageLoading(true);
    setPageError(null);
    try {
      const lead = await LeadApi.getLead(id);
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
  }, [id]);

  useEffect(() => {
    if (isEditing) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void loadLead();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ── Load contacts when client changes ────────────────────────────────────
  useEffect(() => {
    const clientId = formData.clientId;
    let active = true;
    if (!clientId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setContacts([]);
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
        await LeadApi.updateLead(id!, payload);
      } else {
        await LeadApi.createLead(payload);
      }
      isDirtyRef.current = false;
      navigate('/leads');
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
    navigate('/leads');
  };

  // ── Render: loading / error states ──────────────────────────────────────
  if (pageLoading) {
    return <LoadingState message="Loading lead data…" />;
  }

  if (pageError) {
    return (
      <ErrorState
        title="Could not load lead"
        message={pageError}
        onRetry={isEditing ? loadLead : undefined}
      />
    );
  }

  // ── Render: form ─────────────────────────────────────────────────────────
  return (
    <div className="form-page-body">
      {/* API error banner */}
      {apiError && (
        <div className="form-alert form-alert-error" role="alert" aria-live="assertive">
          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
          <span>{apiError}</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        noValidate
        aria-label={isEditing ? 'Edit Lead form' : 'Create Lead form'}
      >
        {/* ── Section: Lead Information ── */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <p className="form-section-heading">Lead Information</p>
          <div className="form-grid">
            {/* Title — full width */}
            <Field
              id="title"
              label="Lead Title"
              required
              error={fieldErrors.title}
              className="form-col-full"
            >
              <input
                type="text"
                id="title"
                name="title"
                className={`form-control${fieldErrors.title ? ' has-error' : ''}`}
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Needs a new e-commerce website"
                required
                aria-required="true"
                aria-describedby={fieldErrors.title ? 'title-error' : undefined}
                disabled={saving}
                maxLength={255}
              />
            </Field>

            {/* Inquiry Source */}
            <Field
              id="inquirySource"
              label="Inquiry Source"
              required
              error={fieldErrors.inquirySource}
            >
              <select
                id="inquirySource"
                name="inquirySource"
                className={`form-control${fieldErrors.inquirySource ? ' has-error' : ''}`}
                value={formData.inquirySource}
                onChange={handleChange}
                required
                aria-required="true"
                aria-describedby={fieldErrors.inquirySource ? 'inquirySource-error' : undefined}
                disabled={saving}
              >
                <option value="WEBSITE">Website</option>
                <option value="REFERRAL">Referral</option>
                <option value="COLD_CALL">Cold Call</option>
                <option value="EVENT">Event</option>
                <option value="OTHER">Other</option>
              </select>
            </Field>

            {/* Status */}
            <Field
              id="status"
              label="Lead Status"
              required
              error={fieldErrors.status}
            >
              <select
                id="status"
                name="status"
                className={`form-control${fieldErrors.status ? ' has-error' : ''}`}
                value={formData.status}
                onChange={handleChange}
                required
                aria-required="true"
                aria-describedby={fieldErrors.status ? 'status-error' : undefined}
                disabled={saving}
              >
                <option value="NEW">New</option>
                <option value="CONTACTED">Contacted</option>
                <option value="QUALIFIED">Qualified</option>
                <option value="PROPOSAL_SENT">Proposal Sent</option>
                <option value="CLOSED_WON">Closed Won</option>
                <option value="CLOSED_LOST">Closed Lost</option>
              </select>
            </Field>
          </div>
        </div>

        {/* ── Section: Client Information ── */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <p className="form-section-heading">Client Information</p>
          <div className="form-grid">
            {/* Client */}
            <Field
              id="clientId"
              label="Client"
              required
              error={fieldErrors.clientId}
              help={
                isEditing
                  ? undefined
                  : undefined
              }
            >
              {isEditing ? (
                /* Disabled in edit — show readable text with locked icon */
                <div style={{ position: 'relative' }}>
                  <select
                    id="clientId"
                    name="clientId"
                    className="form-control"
                    value={formData.clientId}
                    disabled
                    aria-disabled="true"
                    aria-describedby="clientId-help"
                    style={{ paddingRight: '2.5rem' }}
                  >
                    <option value="">No client selected</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                    {/* Fallback if client isn't in the loaded list */}
                    {formData.clientId && !clients.find(c => c.id === formData.clientId) && (
                      <option value={formData.clientId}>Current client</option>
                    )}
                  </select>
                  <Lock
                    size={14}
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      right: '2rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-secondary)',
                      pointerEvents: 'none',
                    }}
                  />
                </div>
              ) : (
                <select
                  id="clientId"
                  name="clientId"
                  className={`form-control${fieldErrors.clientId ? ' has-error' : ''}`}
                  value={formData.clientId}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  aria-describedby={fieldErrors.clientId ? 'clientId-error' : undefined}
                  disabled={saving}
                >
                  <option value="">— Select a client —</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              )}
              {isEditing && (
                <p className="field-disabled-hint" id="clientId-help">
                  <Lock size={11} style={{ display: 'inline', marginRight: 4 }} aria-hidden="true" />
                  The client cannot be changed after the lead is created.
                </p>
              )}
            </Field>

            {/* Client Contact */}
            <Field
              id="contactId"
              label="Client Contact"
              help={
                !formData.clientId
                  ? 'Select a client first to load contacts.'
                  : loadingContacts
                  ? 'Loading contacts…'
                  : contacts.length === 0
                  ? 'No contacts available for this client.'
                  : undefined
              }
            >
              <div style={{ position: 'relative' }}>
                <select
                  id="contactId"
                  name="contactId"
                  className="form-control"
                  value={formData.contactId ?? ''}
                  onChange={handleChange}
                  disabled={saving || !formData.clientId || loadingContacts}
                  aria-describedby="contactId-help"
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
                </select>
                {loadingContacts && (
                  <Loader2
                    size={14}
                    className="animate-spin"
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      right: '2rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-secondary)',
                      pointerEvents: 'none',
                    }}
                  />
                )}
              </div>
            </Field>
          </div>
        </div>

        {/* ── Section: Inquiry Details ── */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <p className="form-section-heading">Inquiry Details</p>
          <div className="form-grid">
            {/* Interested Product */}
            <Field
              id="interestedProduct"
              label="Interested Product / Service"
              help="Optional — the product or service the client expressed interest in."
            >
              <input
                type="text"
                id="interestedProduct"
                name="interestedProduct"
                className="form-control"
                value={formData.interestedProduct ?? ''}
                onChange={handleChange}
                placeholder="e.g. E-commerce Platform"
                disabled={saving}
                maxLength={255}
                aria-describedby="interestedProduct-help"
              />
            </Field>

            {/* Initial Meeting Date & Time */}
            <Field
              id="initialMeetingAt"
              label="Initial Meeting Date and Time"
              error={fieldErrors.initialMeetingAt}
              help="Used to calculate the project brief deadline (meeting time + 24 hours)."
            >
              <input
                type="datetime-local"
                id="initialMeetingAt"
                name="initialMeetingAt"
                className={`form-control${fieldErrors.initialMeetingAt ? ' has-error' : ''}`}
                value={formData.initialMeetingAt}
                onChange={handleChange}
                disabled={saving}
                aria-describedby={
                  fieldErrors.initialMeetingAt
                    ? 'initialMeetingAt-error'
                    : 'initialMeetingAt-help'
                }
              />
            </Field>

            {/* Initial Request — full width */}
            <Field
              id="initialRequest"
              label="Initial Request"
              help="What the client initially requested or described."
              className="form-col-full"
            >
              <textarea
                id="initialRequest"
                name="initialRequest"
                className="form-control"
                value={formData.initialRequest ?? ''}
                onChange={handleChange}
                placeholder="Describe what the client requested…"
                rows={4}
                disabled={saving}
                aria-describedby="initialRequest-help"
              />
            </Field>

            {/* Notes — full width */}
            <Field
              id="notes"
              label="Notes"
              help="Internal notes or observations about this lead."
              className="form-col-full"
            >
              <textarea
                id="notes"
                name="notes"
                className="form-control"
                value={formData.notes ?? ''}
                onChange={handleChange}
                placeholder="Add any additional notes…"
                rows={3}
                disabled={saving}
                aria-describedby="notes-help"
              />
            </Field>
          </div>
        </div>

        {/* ── Form actions ── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            flexWrap: 'wrap',
          }}
        >
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
            aria-disabled={saving}
          >
            {saving
              ? 'Saving…'
              : isEditing
              ? 'Save Changes'
              : 'Create Lead'}
          </Button>
        </div>
      </form>
    </div>
  );
};
