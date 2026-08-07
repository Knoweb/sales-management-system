import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  Edit,
  Eye,
  Handshake,
  Plus,
  Search,
  ShieldAlert,
  ShieldCheck,
  X,
} from "lucide-react";

import { ClientApi } from "../../services/ClientApi";
import type { Client } from "../../types/client";

import { useAuth } from "../../context/AuthContext";
import { PageHeader } from "../../components/PageHeader";
import { PermissionGuard } from "../../components/PermissionGuard";
import { Button } from "../../components/Button";
import { IconButton } from "../../components/IconButton";
import { Card } from "../../components/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/Table";
import { Input, Select } from "../../components/Forms";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../components/FeedbackStates";
import { StatusBadge } from "../../components/StatusBadge";
import { Modal } from "../../components/Modal";
import { ClientForm } from "../../components/clients/ClientForm";

export const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { user } = useAuth();

  const canCreate = user?.permissions.includes("CLIENT_CREATE");

  const loadClients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const activeParam =
        activeFilter === "all"
          ? undefined
          : activeFilter === "active";

      const data = await ClientApi.searchClients(
        searchTerm || undefined,
        activeParam,
        page,
        50,
      );

      setClients(data.content || []);
      setTotalPages(data.page.totalPages);
    } catch (err) {
      console.error("Failed to load clients", err);
      setError("Failed to load clients. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, activeFilter, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadClients();
    }, 400);

    return () => clearTimeout(timer);
  }, [loadClients]);

  const handleEditClick = async (clientId: string) => {
    setIsEditModalOpen(true);
    setEditLoading(true);
    setEditError(null);
    try {
      const clientData = await ClientApi.getClient(clientId);
      setSelectedClient(clientData);
    } catch (err) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setEditError(apiError.response?.data?.message || "Failed to load client details.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleActivateDeactivate = async (client: Client) => {
    try {
      if (client.active) {
        const confirmed = window.confirm(
          "Are you sure you want to deactivate this client?",
        );

        if (!confirmed) {
          return;
        }

        await ClientApi.deactivateClient(client.id);
      } else {
        await ClientApi.activateClient(client.id);
      }

      await loadClients();
    } catch (err) {
      const apiError = err as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      alert(
        apiError.response?.data?.message ||
        "Failed to update client status",
      );
    }
  };

  const filteredClients = useMemo(() => {
    if (typeFilter === "all") {
      return clients;
    }

    return clients.filter(
      (client) => client.clientType === typeFilter,
    );
  }, [clients, typeFilter]);

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <PageHeader
        title="Clients"
        description="Manage clients and their contacts."
        icon={<Handshake size={24} />}
        actionButton={{
          label: "Add Client",
          show: canCreate,
          onClick: () => setIsAddModalOpen(true),
          icon: <Plus size={16} />,
        }}
      />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          width: '100%',
          marginBottom: '0.5rem',
          height: '44px',
        }}
      >
        <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
          <Input
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setPage(0);
            }}
            style={{
              width: '100%',
              height: '44px',
              paddingLeft: '16px',
              paddingRight: searchTerm ? '40px' : '16px',
              borderRadius: '9px',
            }}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setPage(0);
              }}
              style={{
                position: 'absolute',
                right: '12px',
                top: '40%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b',
                padding: '4px',
              }}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div style={{ width: '220px', flexShrink: 0 }}>
          <Select
            value={typeFilter}
            onChange={(event) => {
              setTypeFilter(event.target.value);
              setPage(0);
            }}
          >
            <option value="all">All Types</option>
            <option value="COMPANY">Company</option>
            <option value="INDIVIDUAL">Individual</option>
            <option value="GOVERNMENT">Government</option>
            <option value="NON_PROFIT">Non-Profit</option>
            <option value="OTHER">Other</option>
          </Select>
        </div>

        <div style={{ width: '220px', flexShrink: 0 }}>
          <Select
            value={activeFilter}
            onChange={(event) => {
              setActiveFilter(event.target.value);
              setPage(0);
            }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        </div>
      </div>

      <Card>
        {error ? (
          <ErrorState message={error} onRetry={loadClients} />
        ) : loading && clients.length === 0 ? (
          <LoadingState message="Loading clients..." />
        ) : filteredClients.length === 0 ? (
          <EmptyState
            icon={<Search size={48} />}
            title="No clients found"
            message="Try adjusting your filters or search terms."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader>Name</TableHeader>
                    <TableHeader>Type</TableHeader>
                    <TableHeader>Email</TableHeader>
                    <TableHeader>Phone</TableHeader>
                    <TableHeader>Status</TableHeader>
                    <TableHeader align="right">
                      Actions
                    </TableHeader>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium text-gray-900">
                        {client.name}
                      </TableCell>

                      <TableCell>{client.clientType}</TableCell>

                      <TableCell>{client.email || "-"}</TableCell>

                      <TableCell>{client.phone || "-"}</TableCell>

                      <TableCell>
                        <StatusBadge
                          status={
                            client.active ? "Active" : "Inactive"
                          }
                          variant={
                            client.active ? "success" : "neutral"
                          }
                        />
                      </TableCell>

                      <TableCell align="right">
                        <div className="flex justify-end gap-2">
                          <IconButton
                            onClick={() =>
                              navigate(`/clients/${client.id}`)
                            }
                            title="View Details"
                            aria-label="View Details"
                          >
                            <Eye size={16} />
                          </IconButton>

                          <PermissionGuard permission="CLIENT_UPDATE">
                            <IconButton
                              onClick={() => handleEditClick(client.id)}
                              title="Edit Client"
                              aria-label="Edit Client"
                            >
                              <Edit size={16} />
                            </IconButton>
                          </PermissionGuard>

                          {client.active ? (
                            <PermissionGuard permission="CLIENT_DELETE">
                              <IconButton
                                onClick={() =>
                                  handleActivateDeactivate(client)
                                }
                                title="Deactivate"
                                aria-label="Deactivate"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <ShieldAlert size={16} />
                              </IconButton>
                            </PermissionGuard>
                          ) : (
                            <PermissionGuard permission="CLIENT_UPDATE">
                              <IconButton
                                onClick={() =>
                                  handleActivateDeactivate(client)
                                }
                                title="Activate"
                                aria-label="Activate"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                <ShieldCheck size={16} />
                              </IconButton>
                            </PermissionGuard>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center mt-6 space-x-4 border-t border-gray-200 pt-4">
                <Button
                  variant="outline"
                  disabled={page === 0 || loading}
                  onClick={() =>
                    setPage((currentPage) => currentPage - 1)
                  }
                >
                  Previous
                </Button>

                <span className="flex items-center text-gray-700 text-sm font-medium">
                  Page {page + 1} of {totalPages}
                </span>

                <Button
                  variant="outline"
                  disabled={
                    page >= totalPages - 1 || loading
                  }
                  onClick={() =>
                    setPage((currentPage) => currentPage + 1)
                  }
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </Card>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Client"
        maxWidth="740px"
      >
        <ClientForm
          onSuccess={() => {
            setIsAddModalOpen(false);
            void loadClients();
          }}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedClient(null);
        }}
        title="Edit Client"
        maxWidth="740px"
      >
        {editLoading ? (
          <div className="p-8">
            <LoadingState message="Loading client details..." />
          </div>
        ) : editError ? (
          <div className="p-8">
            <ErrorState message={editError} />
          </div>
        ) : selectedClient ? (
          <ClientForm
            initialData={selectedClient}
            onSuccess={() => {
              setIsEditModalOpen(false);
              setSelectedClient(null);
              void loadClients();
            }}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedClient(null);
            }}
          />
        ) : null}
      </Modal>
    </div>
  );
};