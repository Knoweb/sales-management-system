import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { ClientForm } from '../components/clients/ClientForm';
import { ClientApi } from '../services/ClientApi';
import type { Client } from '../types/client';

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
    <div className="page-container">
      <PageHeader 
        title={isEditMode ? 'Edit Client' : 'Create Client'}
        description={isEditMode ? 'Update existing client information.' : 'Add a new client to the system.'}
      />

      <div className="card" style={{ maxWidth: '800px' }}>
        <div className="card-body">
          {error ? (
            <div className="error-message" style={{ color: 'var(--error)' }}>
              {error}
            </div>
          ) : loading ? (
            <p>Loading client details...</p>
          ) : (
            <ClientForm 
              initialData={client}
              onSuccess={(savedClient) => navigate(`/clients/${savedClient.id}`)}
              onCancel={() => navigate('/clients')}
            />
          )}
        </div>
      </div>
    </div>
  );
};
