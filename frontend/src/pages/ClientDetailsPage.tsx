import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ClientApi } from '../services/ClientApi';
import type { Client } from '../types/client';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';
import { Briefcase, Building, Mail, Phone, MapPin, Edit, ShieldAlert, ShieldCheck } from 'lucide-react';
import { PermissionGuard } from '../components/PermissionGuard';
import { ContactList } from '../components/clients/ContactList';

export const ClientDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleActivateDeactivate = async () => {
    if (!client) return;
    try {
      if (client.active) {
        if (!window.confirm('Are you sure you want to deactivate this client?')) return;
        await ClientApi.deactivateClient(client.id);
      } else {
        await ClientApi.activateClient(client.id);
      }
      void loadClientDetails();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error?.response?.data?.message || 'Failed to update client status');
    }
  };

  if (loading) return <div className="page-container"><p>Loading client details...</p></div>;
  if (error || !client) return <div className="page-container"><div className="error-message">{error || 'Client not found'}</div></div>;

  return (
    <div className="page-container">
      <PageHeader 
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Briefcase size={24} className="inline-icon" />
            {client.name}
            <span style={{ 
              padding: '0.25rem 0.5rem', 
              borderRadius: '1rem', 
              fontSize: '0.75rem',
              backgroundColor: client.active ? 'var(--success-bg)' : 'var(--error-bg)',
              color: client.active ? 'var(--success)' : 'var(--error)',
              marginLeft: '1rem',
              verticalAlign: 'middle'
            }}>
              {client.active ? 'Active' : 'Inactive'}
            </span>
          </div>
        }
        description={`Client Type: ${client.clientType.replace('_', ' ')}`}
      />
      {/* Workaround to inject guarded buttons into header area since PageHeader only takes one simplistic action button */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '-3rem', justifyContent: 'flex-end', marginBottom: '2rem', position: 'relative', zIndex: 10 }}>
        <PermissionGuard permission="CLIENT_UPDATE">
          <Button variant="secondary" onClick={() => navigate(`/clients/${client.id}/edit`)}>
            <Edit size={16} style={{ marginRight: '0.5rem' }} /> Edit Details
          </Button>
        </PermissionGuard>
        
        {client.active ? (
          <PermissionGuard permission="CLIENT_DELETE">
            <Button variant="secondary" onClick={handleActivateDeactivate} style={{ color: 'var(--error)', borderColor: 'var(--error)' }}>
              <ShieldAlert size={16} style={{ marginRight: '0.5rem' }} /> Deactivate
            </Button>
          </PermissionGuard>
        ) : (
          <PermissionGuard permission="CLIENT_UPDATE">
            <Button variant="secondary" onClick={handleActivateDeactivate} style={{ color: 'var(--success)', borderColor: 'var(--success)' }}>
              <ShieldCheck size={16} style={{ marginRight: '0.5rem' }} /> Activate
            </Button>
          </PermissionGuard>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Client Information</h2>
          </div>
          <div className="card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-light)', marginBottom: '0.25rem' }}>Registration Number</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
                <Building size={16} style={{ color: 'var(--text-light)' }} />
                {client.registrationNumber || '-'}
              </div>
            </div>
            
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-light)', marginBottom: '0.25rem' }}>Industry</p>
              <div style={{ fontWeight: 500 }}>
                {client.industry || '-'}
              </div>
            </div>

            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-light)', marginBottom: '0.25rem' }}>Email</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
                <Mail size={16} style={{ color: 'var(--text-light)' }} />
                {client.email || '-'}
              </div>
            </div>

            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-light)', marginBottom: '0.25rem' }}>Phone</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
                <Phone size={16} style={{ color: 'var(--text-light)' }} />
                {client.phone || '-'}
              </div>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-light)', marginBottom: '0.25rem' }}>Address</p>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontWeight: 500 }}>
                <MapPin size={16} style={{ color: 'var(--text-light)', marginTop: '0.125rem' }} />
                <span style={{ whiteSpace: 'pre-line' }}>{client.address || '-'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <ContactList clientId={client.id} contacts={client.contacts} onRefresh={loadClientDetails} />
          </div>
        </div>
      </div>
    </div>
  );
};
