import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ClientApi } from '../../services/ClientApi';
import type { Client } from '../../types/client';
import { PageHeader } from '../../components/PageHeader';
import { Button } from '../../components/Button';
import { Handshake, Briefcase, Building, Mail, Phone, MapPin, Edit, ShieldAlert, ShieldCheck, Users, Activity, FileText, Target } from 'lucide-react';
import { PermissionGuard } from '../../components/PermissionGuard';
import { ContactList } from '../../components/clients/ContactList';
import { Tabs, type TabItem } from '../../components/Tabs';
import { Card } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { EmptyState } from '../../components/FeedbackStates';

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

  if (loading) return <div className="p-6 max-w-7xl mx-auto"><p>Loading client details...</p></div>;
  if (error || !client) return <div className="p-6 max-w-7xl mx-auto"><div className="text-red-600">{error || 'Client not found'}</div></div>;

  const tabs: TabItem[] = [
    { id: 'overview', label: 'Overview', icon: <Briefcase size={16} /> },
    { id: 'contacts', label: 'Contacts', icon: <Users size={16} /> },
    { id: 'leads', label: 'Leads', icon: <Target size={16} /> },
    { id: 'attachments', label: 'Attachments', icon: <FileText size={16} /> },
    { id: 'activity', label: 'Activity', icon: <Activity size={16} /> }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <PageHeader 
        title={
          <div className="flex items-center gap-2">
            {client.name}
            <div className="ml-4">
              <StatusBadge 
                status={client.active ? 'Active' : 'Inactive'} 
                variant={client.active ? 'success' : 'error'} 
              />
            </div>
          </div>
        }
        icon={<Handshake size={24} />}
        description={`Client Type: ${client.clientType.replace('_', ' ')}`}
      />
      
      {/* Action Buttons */}
      <div className="flex gap-4 justify-end mb-6 -mt-16 relative z-10">
        <PermissionGuard permission="CLIENT_UPDATE">
          <Button variant="secondary" onClick={() => navigate(`/clients/${client.id}/edit`)}>
            <Edit size={16} className="mr-2" /> Edit Details
          </Button>
        </PermissionGuard>
        
        {client.active ? (
          <PermissionGuard permission="CLIENT_DELETE">
            <Button variant="danger" onClick={handleActivateDeactivate}>
              <ShieldAlert size={16} className="mr-2" /> Deactivate
            </Button>
          </PermissionGuard>
        ) : (
          <PermissionGuard permission="CLIENT_UPDATE">
            <Button variant="primary" onClick={handleActivateDeactivate} style={{ backgroundColor: 'var(--color-success)', borderColor: 'var(--color-success)' }}>
              <ShieldCheck size={16} className="mr-2" /> Activate
            </Button>
          </PermissionGuard>
        )}
      </div>

      <div className="mb-6">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Company Information</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Registration Number</p>
                  <div className="flex items-center gap-2 font-medium text-gray-900">
                    <Building size={16} className="text-gray-400" />
                    {client.registrationNumber || '-'}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Industry</p>
                  <div className="font-medium text-gray-900">
                    {client.industry || '-'}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <div className="font-medium text-gray-900">
                    {client.active ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Contact Details</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <div className="flex items-center gap-2 font-medium text-gray-900">
                    <Mail size={16} className="text-gray-400" />
                    {client.email || '-'}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Phone</p>
                  <div className="flex items-center gap-2 font-medium text-gray-900">
                    <Phone size={16} className="text-gray-400" />
                    {client.phone || '-'}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Address</p>
                  <div className="flex items-start gap-2 font-medium text-gray-900">
                    <MapPin size={16} className="text-gray-400 mt-1" />
                    <span className="whitespace-pre-line">{client.address || '-'}</span>
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
          <Card>
            <EmptyState 
              icon={<Target size={48} />}
              title="Leads Module" 
              message="Client leads will be displayed here." 
            />
          </Card>
        )}

        {activeTab === 'attachments' && (
          <Card>
            <EmptyState 
              icon={<FileText size={48} />}
              title="Attachments Module" 
              message="Client attachments will be displayed here." 
            />
          </Card>
        )}

        {activeTab === 'activity' && (
          <Card>
            <EmptyState 
              icon={<Activity size={48} />}
              title="Activity Module" 
              message="Client activity timeline will be displayed here." 
            />
          </Card>
        )}
      </div>
    </div>
  );
};
