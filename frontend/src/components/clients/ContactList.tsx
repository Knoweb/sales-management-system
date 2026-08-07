import React, { useState } from "react";
import {
  Edit,
  ShieldAlert,
  ShieldCheck,
  Star,
  StarOff,
} from "lucide-react";

import type { ClientContact } from "../../types/client";
import { ClientApi } from "../../services/ClientApi";

import { Button } from "../Button";
import { IconButton } from "../IconButton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../Table";
import { PermissionGuard } from "../PermissionGuard";
import { StatusBadge } from "../StatusBadge";
import { EmptyState } from "../FeedbackStates";
import { ContactModal } from "./ContactModal";

interface ContactListProps {
  clientId: string;
  contacts: ClientContact[];
  onRefresh: () => void;
}

export const ContactList: React.FC<ContactListProps> = ({
  clientId,
  contacts,
  onRefresh,
}) => {
  const [editingContact, setEditingContact] = useState<
    ClientContact | undefined
  >(undefined);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEdit = (contact: ClientContact) => {
    setEditingContact(contact);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingContact(undefined);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingContact(undefined);
  };

  const handleModalSuccess = () => {
    onRefresh();
    setIsModalOpen(false);
    setEditingContact(undefined);
  };

  const handleSetPrimary = async (contactId: string) => {
    try {
      await ClientApi.setPrimaryContact(clientId, contactId);
      onRefresh();
    } catch (err) {
      const error = err as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      alert(
        error?.response?.data?.message ||
          "Failed to set primary contact",
      );
    }
  };

  const handleToggleStatus = async (contact: ClientContact) => {
    try {
      if (contact.active) {
        const confirmed = window.confirm(
          "Are you sure you want to deactivate this contact?",
        );

        if (!confirmed) {
          return;
        }

        await ClientApi.deactivateClientContact(
          clientId,
          contact.id,
        );
      } else {
        await ClientApi.activateClientContact(
          clientId,
          contact.id,
        );
      }

      onRefresh();
    } catch (err) {
      const error = err as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      alert(
        error?.response?.data?.message ||
          "Failed to update contact status",
      );
    }
  };

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          marginBottom: "2rem",
        }}
      >
        <h3 className="text-lg font-medium text-gray-900">
          Contacts
        </h3>

        <div style={{ marginLeft: "auto" }}>
          <PermissionGuard permission="CLIENT_UPDATE">
            <Button onClick={handleAddNew}>
              Add Contact
            </Button>
          </PermissionGuard>
        </div>
      </div>

      {/* Contact List */}
      {contacts.length === 0 ? (
        <EmptyState
          title="No contacts added"
          message="This client has no contacts."
        />
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
                <TableHeader align="right">
                  Actions
                </TableHeader>
              </TableRow>
            </TableHead>

            <TableBody>
              {contacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>
                    <div className="flex items-center gap-2 font-medium text-gray-900">
                      <span>
                        {contact.firstName} {contact.lastName}
                      </span>

                      {contact.primary && (
                        <span
                          title="Primary Contact"
                          className="text-yellow-500"
                        >
                          <Star
                            size={16}
                            fill="currentColor"
                          />
                        </span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    {contact.jobTitle || "-"}
                  </TableCell>

                  <TableCell>
                    {contact.email || "-"}
                  </TableCell>

                  <TableCell>
                    {contact.phone || "-"}
                  </TableCell>

                  <TableCell>
                    <StatusBadge
                      status={
                        contact.active
                          ? "Active"
                          : "Inactive"
                      }
                      variant={
                        contact.active
                          ? "success"
                          : "neutral"
                      }
                    />
                  </TableCell>

                  <TableCell align="right">
                    <div className="flex justify-end gap-2">
                      <PermissionGuard permission="CLIENT_UPDATE">
                        <IconButton
                          onClick={() =>
                            handleEdit(contact)
                          }
                          title="Edit Contact"
                          aria-label="Edit Contact"
                        >
                          <Edit size={16} />
                        </IconButton>

                        {!contact.primary &&
                          contact.active && (
                            <IconButton
                              onClick={() =>
                                handleSetPrimary(
                                  contact.id,
                                )
                              }
                              title="Set as Primary"
                              aria-label="Set as Primary"
                              className="text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700"
                            >
                              <StarOff size={16} />
                            </IconButton>
                          )}

                        {contact.active ? (
                          <IconButton
                            onClick={() =>
                              handleToggleStatus(
                                contact,
                              )
                            }
                            title="Deactivate Contact"
                            aria-label="Deactivate Contact"
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            <ShieldAlert size={16} />
                          </IconButton>
                        ) : (
                          <IconButton
                            onClick={() =>
                              handleToggleStatus(
                                contact,
                              )
                            }
                            title="Activate Contact"
                            aria-label="Activate Contact"
                            className="text-green-600 hover:bg-green-50 hover:text-green-700"
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

      {/* Add / Edit Contact Modal */}
      {isModalOpen && (
        <ContactModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSuccess={handleModalSuccess}
          clientId={clientId}
          initialData={editingContact}
        />
      )}
    </div>
  );
};