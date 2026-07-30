import React, { useState } from 'react';
import type { ClientContact } from '../../types/client';
import { ClientApi } from '../../services/ClientApi';
import { Button } from '../Button';
import { Edit, ShieldCheck, ShieldAlert, Star, StarOff } from 'lucide-react';
import { PermissionGuard } from '../PermissionGuard';
import { ContactModal } from './ContactModal';

interface ContactListProps {
  clientId: string;
  contacts: ClientContact[];
  onRefresh: () => void;
}

export const ContactList: React.FC<ContactListProps> = ({ clientId, contacts, onRefresh }) => {
  const [editingContact, setEditingContact] = useState<ClientContact | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEdit = (contact: ClientContact) => {
    setEditingContact(contact);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingContact(undefined);
    setIsModalOpen(true);
  };

  const handleSetPrimary = async (contactId: string) => {
    try {
      await ClientApi.setPrimaryContact(clientId, contactId);
      onRefresh();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error?.response?.data?.message || 'Failed to set primary contact');
    }
  };

  const handleToggleStatus = async (contact: ClientContact) => {
    try {
      if (contact.active) {
        if (!window.confirm('Are you sure you want to deactivate this contact?')) return;
        await ClientApi.deactivateClientContact(clientId, contact.id);
      } else {
        await ClientApi.activateClientContact(clientId, contact.id);
      }
      onRefresh();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error?.response?.data?.message || 'Failed to update contact status');
    }
  };

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Contacts</h3>
        <PermissionGuard permission="CLIENT_UPDATE">
          <Button variant="secondary" onClick={handleAddNew}>Add Contact</Button>
        </PermissionGuard>
      </div>

      {contacts.length === 0 ? (
        <p style={{ color: 'var(--text-light)', padding: '1rem', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
          No contacts found for this client.
        </p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Title</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map(contact => (
                <tr key={contact.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {contact.firstName} {contact.lastName}
                      {contact.primary && <span title="Primary Contact" style={{ color: 'var(--primary)' }}><Star size={16} fill="currentColor" /></span>}
                    </div>
                  </td>
                  <td>{contact.jobTitle || '-'}</td>
                  <td>{contact.email || '-'}</td>
                  <td>{contact.phone || '-'}</td>
                  <td>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '1rem', 
                      fontSize: '0.75rem',
                      backgroundColor: contact.active ? 'var(--success-bg)' : 'var(--error-bg)',
                      color: contact.active ? 'var(--success)' : 'var(--error)'
                    }}>
                      {contact.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <PermissionGuard permission="CLIENT_UPDATE">
                        <Button variant="ghost" onClick={() => handleEdit(contact)} title="Edit Contact">
                          <Edit size={16} />
                        </Button>
                        
                        {!contact.primary && contact.active && (
                          <Button variant="ghost" onClick={() => handleSetPrimary(contact.id)} title="Set as Primary" style={{ color: 'var(--warning)' }}>
                            <StarOff size={16} />
                          </Button>
                        )}
                        
                        {contact.active ? (
                          <Button variant="ghost" onClick={() => handleToggleStatus(contact)} title="Deactivate Contact" style={{ color: 'var(--error)' }}>
                            <ShieldAlert size={16} />
                          </Button>
                        ) : (
                          <Button variant="ghost" onClick={() => handleToggleStatus(contact)} title="Activate Contact" style={{ color: 'var(--success)' }}>
                            <ShieldCheck size={16} />
                          </Button>
                        )}
                      </PermissionGuard>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ContactModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => { onRefresh(); setIsModalOpen(false); }}
        clientId={clientId}
        initialData={editingContact}
      />
    </div>
  );
};
