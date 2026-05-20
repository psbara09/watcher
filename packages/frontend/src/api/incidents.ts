import { incidentClient } from './client';
import {
  Incident,
  IncidentListResponse,
  CreateIncidentRequest,
  Evidence,
  EvidenceAccessResponse,
} from '@watcher/shared';

export const incidentApi = {
  async create(data: CreateIncidentRequest): Promise<Incident> {
    const response = await incidentClient.post<Incident>('/api/incidents', data);
    return response.data;
  },

  async list(status?: string): Promise<IncidentListResponse> {
    const params = status ? { status } : {};
    const response = await incidentClient.get<IncidentListResponse>('/api/incidents', { params });
    return response.data;
  },

  async getById(id: string): Promise<Incident> {
    const response = await incidentClient.get<Incident>(`/api/incidents/${id}`);
    return response.data;
  },

  async uploadEvidence(incidentId: string, file: File): Promise<{ evidence: Evidence }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await incidentClient.post<{ evidence: Evidence }>(
      `/api/incidents/${incidentId}/evidence`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  async getEvidenceUrl(incidentId: string, evidenceId: string): Promise<EvidenceAccessResponse> {
    const response = await incidentClient.get<EvidenceAccessResponse>(
      `/api/incidents/${incidentId}/evidence/${evidenceId}`
    );
    return response.data;
  },

  async listEvidence(incidentId: string): Promise<{ evidence: Evidence[]; total: number }> {
    const response = await incidentClient.get<{ evidence: Evidence[]; total: number }>(
      `/api/incidents/${incidentId}/evidence`
    );
    return response.data;
  },
};
