import { verificationClient } from './client';
import {
  VerificationRecord,
  VerificationQueueResponse,
  SubmitReviewRequest,
  VerificationHistory,
} from '@watcher/shared';

export interface VerificationDetailResponse extends VerificationRecord {
  history: VerificationHistory[];
}

export const verificationApi = {
  async getQueue(): Promise<VerificationQueueResponse> {
    const response = await verificationClient.get<VerificationQueueResponse>('/api/verification/queue');
    return response.data;
  },

  async getById(id: string): Promise<VerificationDetailResponse> {
    const response = await verificationClient.get<VerificationDetailResponse>(`/api/verification/${id}`);
    return response.data;
  },

  async getByIncidentId(incidentId: string): Promise<VerificationDetailResponse> {
    const response = await verificationClient.get<VerificationDetailResponse>(`/api/verification/incident/${incidentId}`);
    return response.data;
  },

  async submitReview(id: string, data: SubmitReviewRequest): Promise<VerificationRecord> {
    const response = await verificationClient.post<VerificationRecord>(`/api/verification/${id}/review`, data);
    return response.data;
  },
};
