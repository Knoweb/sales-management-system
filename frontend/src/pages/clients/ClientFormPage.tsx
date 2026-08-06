import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../../components/PageHeader';
import { ClientForm } from '../../components/clients/ClientForm';
import { ClientApi } from '../../services/ClientApi';
import { Card } from '../../components/Card';
import type { Client } from '../../types/client';

import { Handshake } from 'lucide-react';

export const ClientFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [client, setClient] = useState<Client | undefined>(undefined);
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEditMode && id) {
      const loadClient = async () => {
        try {
          const data = await ClientApi.getClient(id);
          setClient(data);
        } catch (err) {
          const error = err as { response?: { data?: { message?: string } } };
          setError(error?.response?.data?.message || 'Failed to load client details.');
        } finally {
          setLoading(false);
        }
      };
      void loadClient();
    }
  }, [id, isEditMode]);

  return (
    <div className="p-6 max-w-4xl mx-auto w-full">
      <PageHeader 
        title={isEditMode ? 'Edit Client' : 'Create Client'}
        description={isEditMode ? 'Update existing client information.' : 'Add a new client to the system.'}
        icon={<Handshake size={24} />}
      />

      <Card>
        {error ? (
          <div className="text-red-600 mb-4 bg-red-50 p-4 rounded-md">
            {error}
          </div>
        ) : loading ? (
          <div className="p-4 text-gray-500">Loading client details...</div>
        ) : (
          <ClientForm 
            initialData={client}
            onSuccess={(savedClient) => navigate(`/clients/${savedClient.id}`)}
            onCancel={() => navigate('/clients')}
          />
        )}
      </Card>
    </div>
  );
};
