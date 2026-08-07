import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ClientApi } from '../../services/ClientApi';
import type { Client } from '../../types/client';
import { PageHeader } from '../../components/PageHeader';
import { Handshake, Briefcase, Users, FileText, Target, ArrowLeft } from 'lucide-react';
import { ContactList } from '../../components/clients/ContactList';
import { Tabs, type TabItem } from '../../components/Tabs';
import { Card } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { LeadList } from '../../components/leads/LeadList';
import { LeadAttachments } from '../../components/leads/LeadAttachments';
import { Button } from '../../components/Button';


export const ClientDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const loadClientDetails = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await ClientApi.getClient(id);

      // Also load full contacts list to ensure we have the most up to date statuses
      const contacts = await ClientApi.getClientContacts(id);
      data.contacts = contacts;

      setClient(data);
    } catch (err) {
      const error = err as { response?: { status?: number, data?: { message?: string } } };
      if (error?.response?.status === 404) {
        setError('Client not found.');
      } else {
        setError(error?.response?.data?.message || 'Failed to load client details.');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadClientDetails();
  }, [loadClientDetails]);

  if (loading) return <div className="p-6 max-w-7xl mx-auto"><p>Loading client details...</p></div>;
  if (error || !client) return <div className="p-6 max-w-7xl mx-auto"><div className="text-red-600">{error || 'Client not found'}</div></div>;

  const tabs: TabItem[] = [
    { id: 'overview', label: 'Overview', icon: <Briefcase size={16} /> },
    { id: 'contacts', label: 'Contacts', icon: <Users size={16} /> },
    { id: 'leads', label: 'Leads', icon: <Target size={16} /> },
    { id: 'attachments', label: 'Attachments', icon: <FileText size={16} /> }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <div style={{ marginBottom: '20px' }}>
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate('/clients')}
          style={{
            height: '40px',
            paddingInline: '12px',
            backgroundColor: '#f8fafc',
            color: '#475569',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            boxShadow: 'none',
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <ArrowLeft size={18} strokeWidth={2.2} />
            Back to Clients
          </span>
        </Button>
      </div>

      <PageHeader
        title={client.name}
        icon={<Handshake size={24} />}
        description={`Client Type: ${client.clientType.replace('_', ' ')}`}
        actionElement={
          <StatusBadge
            status={client.active ? 'Active' : 'Inactive'}
            variant={client.active ? 'success' : 'error'}
          />
        }
      />

      <div className="mb-6 mt-6">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start mb-6">
            <Card>
              <div style={{ padding: '24px' }}>
                <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
                  <h2 style={{ margin: 0, color: '#0f172a', fontSize: '20px', fontWeight: 700, lineHeight: 1.3 }}>
                    Client Information
                  </h2>
                  <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '14px', lineHeight: 1.5 }}>
                    Basic client details
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '14px' }}>
                  <div style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Client Name</p>
                    <p style={{ margin: '7px 0 0', color: '#0f172a', fontSize: '16px', fontWeight: 600, lineHeight: 1.5, wordBreak: 'break-word' }}>{client.name}</p>
                  </div>
                  <div style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Client Type</p>
                    <p style={{ margin: '7px 0 0', color: '#0f172a', fontSize: '16px', fontWeight: 600, lineHeight: 1.5 }}>{client.clientType.replace('_', ' ')}</p>
                  </div>
                  <div style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Registration Number</p>
                    <p style={{ margin: '7px 0 0', color: '#0f172a', fontSize: '16px', fontWeight: 600, lineHeight: 1.5 }}>{client.registrationNumber || 'N/A'}</p>
                  </div>
                  <div style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Industry</p>
                    <p style={{ margin: '7px 0 0', color: '#0f172a', fontSize: '16px', fontWeight: 600, lineHeight: 1.5 }}>{client.industry || 'N/A'}</p>
                  </div>
                  <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                    <div>
                      <p style={{ margin: 0, color: '#64748b', fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Current Status</p>
                      <p style={{ margin: '6px 0 0', color: '#475569', fontSize: '14px' }}>Client availability</p>
                    </div>
                    <StatusBadge status={client.active ? 'Active' : 'Inactive'} variant={client.active ? 'success' : 'error'} />
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div style={{ padding: '24px' }}>
                <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
                  <h2 style={{ margin: 0, color: '#0f172a', fontSize: '20px', fontWeight: 700, lineHeight: 1.3 }}>
                    Contact Information
                  </h2>
                  <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '14px', lineHeight: 1.5 }}>
                    Primary contact details
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '14px' }}>
                  <div style={{ padding: '18px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Email</p>
                    <p style={{ margin: '8px 0 0', color: '#0f172a', fontSize: '16px', fontWeight: 600, lineHeight: 1.5, wordBreak: 'break-all' }}>{client.email || 'N/A'}</p>
                  </div>
                  <div style={{ padding: '18px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Phone</p>
                    <p style={{ margin: '8px 0 0', color: '#0f172a', fontSize: '16px', fontWeight: 600, lineHeight: 1.5 }}>{client.phone || 'N/A'}</p>
                  </div>
                  <div style={{ gridColumn: '1 / -1', padding: '18px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Address</p>
                    <p style={{ margin: '8px 0 0', color: '#0f172a', fontSize: '16px', fontWeight: 600, lineHeight: 1.5, whiteSpace: 'pre-line' }}>{client.address || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'contacts' && (
          <Card>
            <ContactList clientId={client.id} contacts={client.contacts} onRefresh={loadClientDetails} />
          </Card>
        )}

        {activeTab === 'leads' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <LeadList clientId={client.id} hideFilters viewOnly />
          </div>
        )}

        {activeTab === 'attachments' && (
          <LeadAttachments entityId={client.id} entityType="CLIENT" />
        )}


      </div>
    </div>
  );
};
