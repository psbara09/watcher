import { User } from './user';
import { Tenant } from './tenant';
import { Incident, IncidentType, IncidentStatus, Evidence } from './incident';
import { VerificationRecord, ReviewDecision } from './verification';

// ============ Auth API ============

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  tenant: Tenant | null;
}

export interface VerifyTokenRequest {
  token: string;
}

export interface VerifyTokenResponse {
  valid: boolean;
  user: User | null;
  tenant: Tenant | null;
  role: string | null;
}

export interface ProfileResponse {
  user: User;
  tenant: Tenant | null;
}

// ============ Incident API ============

export interface CreateIncidentRequest {
  timestamp: string;
  incidentType: IncidentType;
  suspectDetails: string;
  description: string;
}

export interface UpdateStatusRequest {
  status: IncidentStatus;
}

export interface IncidentListResponse {
  incidents: Incident[];
  total: number;
}

export interface EvidenceUploadResponse {
  evidence: Evidence;
}

export interface EvidenceAccessResponse {
  presignedUrl: string;
  expiresIn: number;
}

// ============ Verification API ============

export interface SubmitVerificationRequest {
  incidentId: string;
  tenantId: string;
}

export interface VerificationQueueResponse {
  items: VerificationRecord[];
  total: number;
}

export interface SubmitReviewRequest {
  decision: ReviewDecision;
  notes: string;
}

// ============ Common API ============

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

export interface HealthResponse {
  status: 'ok';
  service: string;
  timestamp: string;
}
