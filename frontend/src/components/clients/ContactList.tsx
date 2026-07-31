import React, { useState } from 'react';
import type { ClientContact } from '../../types/client';
import { ClientApi } from '../../services/ClientApi';
import { Button } from '../Button';
import { IconButton } from '../IconButton';
import { Star, StarOff, Edit, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../Table';
import { PermissionGuard } from '../PermissionGuard';
import { ContactModal } from './ContactModal';
import { StatusBadge } from '../StatusBadge';

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
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Contacts</h3>
        <PermissionGuard permission="CLIENT_UPDATE">
          <Button variant="secondary" onClick={handleAddNew}>Add Contact</Button>
        </PermissionGuard>
      </div>

      {contacts.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-md border border-dashed border-gray-300">
          <p className="text-gray-500">No contacts found for this client.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Name</TableHeader>
                <TableHeader>Title</TableHeader>
                <TableHeader>Email</TableHeader>
                <TableHeader>Phone</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader align="right">Actions</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {contacts.map(contact => (
                <TableRow key={contact.id}>
                  <TableCell>
                    <div className="flex items-center gap-2 font-medium text-gray-900">
                      {contact.firstName} {contact.lastName}
                      {contact.primary && (
                        <span title="Primary Contact" className="text-yellow-500">
                          <Star size={16} fill="currentColor" />
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{contact.jobTitle || '-'}</TableCell>
                  <TableCell>{contact.email || '-'}</TableCell>
                  <TableCell>{contact.phone || '-'}</TableCell>
                  <TableCell>
                    <StatusBadge 
                      status={contact.active ? 'Active' : 'Inactive'} 
                      variant={contact.active ? 'success' : 'neutral'} 
                    />
                  </TableCell>
                  <TableCell align="right">
                    <div className="flex justify-end gap-2">
                      <PermissionGuard permission="CLIENT_UPDATE">
                        <IconButton onClick={() => handleEdit(contact)} title="Edit Contact" aria-label="Edit Contact">
                          <Edit size={16} />
                        </IconButton>
                        
                        {!contact.primary && contact.active && (
                          <IconButton 
                            onClick={() => handleSetPrimary(contact.id)} 
                            title="Set as Primary" 
                            aria-label="Set as Primary"
                            className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                          >
                            <StarOff size={16} />
                          </IconButton>
                        )}
                        
                        {contact.active ? (
                          <IconButton 
                            onClick={() => handleToggleStatus(contact)} 
                            title="Deactivate Contact"
                            aria-label="Deactivate Contact" 
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <ShieldAlert size={16} />
                          </IconButton>
                        ) : (
                          <IconButton 
                            onClick={() => handleToggleStatus(contact)} 
                            title="Activate Contact" 
                            aria-label="Activate Contact"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <ShieldCheck size={16} />
                          </IconButton>
                        )}
                      </PermissionGuard>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
