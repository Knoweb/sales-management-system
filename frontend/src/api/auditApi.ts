import { apiClient as api } from '../services/Api';

export interface AuditLogEventDTO {
  id: string;
  eventType: string;
  actorUserId?: string;
  actorNameSnapshot?: string;
  entityType: string;
  entityId: string;
  action: string;
  previousState?: any;
  newState?: any;
  comments?: string;
  occurredAt: string;
  correlationId?: string;
  requestPath?: string;
  metadata?: string;
}

export const getAuditLogs = async (
  page: number = 0,
  size: number = 20,
  entityType?: string,
  entityId?: string
): Promise<{ content: AuditLogEventDTO[]; totalElements: number; totalPages: number }> => {
  const params: any = { page, size };
  if (entityType) params.entityType = entityType;
  if (entityId) params.entityId = entityId;

  const response = await api.get('/audit-logs', { params });
  return response.data;
};

export const getAuditLogById = async (id: string): Promise<AuditLogEventDTO> => {
  const response = await api.get(`/audit-logs/${id}`);
  return response.data;
};
