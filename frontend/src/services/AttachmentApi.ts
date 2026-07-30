import { apiClient as api, API_BASE_URL } from './Api';
import type { Attachment } from '../types/attachment';

export const AttachmentApi = {
  uploadFile: async (entityId: string, entityType: string, file: File) => {
    const formData = new FormData();
    formData.append('entityId', entityId);
    formData.append('entityType', entityType);
    formData.append('file', file);

    const response = await api.post<Attachment>('/attachments', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getAttachments: async (entityType: string, entityId: string) => {
    const response = await api.get<Attachment[]>(`/attachments/entity/${entityType}/${entityId}`);
    return response.data;
  },

  downloadUrl: (attachmentId: string) => {
    // Generate URL for a-tag href
    // Need to include base URL if not using axios for direct href
    return `${API_BASE_URL}/attachments/${attachmentId}/download`;
  },

  deleteAttachment: async (attachmentId: string) => {
    await api.delete(`/attachments/${attachmentId}`);
  }
};
