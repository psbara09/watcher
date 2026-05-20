import { IncidentStatus, IncidentType } from '../types/incident';
import { UserRole } from '../types/user';
import { VerificationStatus } from '../types/verification';

// Status arrays
export const INCIDENT_STATUSES = Object.values(IncidentStatus);
export const INCIDENT_TYPES = Object.values(IncidentType);
export const USER_ROLES = Object.values(UserRole);
export const VERIFICATION_STATUSES = Object.values(VerificationStatus);

// File upload constraints
export const MAX_EVIDENCE_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const ALLOWED_EVIDENCE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'video/mp4',
  'video/mpeg',
];

// JWT configuration
export const JWT_EXPIRY = '24h';

// MinIO / Evidence
export const PRESIGNED_URL_EXPIRY = 3600; // 1 hour in seconds
export const EVIDENCE_BUCKET = 'evidence';

// Incident status transition map (current → allowed next statuses)
export const VALID_STATUS_TRANSITIONS: Record<IncidentStatus, IncidentStatus[]> = {
  [IncidentStatus.DRAFT]: [IncidentStatus.SUBMITTED],
  [IncidentStatus.SUBMITTED]: [IncidentStatus.UNDER_REVIEW],
  [IncidentStatus.UNDER_REVIEW]: [IncidentStatus.APPROVED, IncidentStatus.REJECTED],
  [IncidentStatus.APPROVED]: [],
  [IncidentStatus.REJECTED]: [],
};

// Incident type display labels
export const INCIDENT_TYPE_LABELS: Record<IncidentType, string> = {
  [IncidentType.THEFT]: 'Theft',
  [IncidentType.ASSAULT]: 'Assault',
  [IncidentType.VANDALISM]: 'Vandalism',
  [IncidentType.FRAUD]: 'Fraud',
  [IncidentType.TRESPASS]: 'Trespass',
  [IncidentType.ANTISOCIAL_BEHAVIOUR]: 'Antisocial Behaviour',
  [IncidentType.OTHER]: 'Other',
};

// Incident status display labels
export const INCIDENT_STATUS_LABELS: Record<IncidentStatus, string> = {
  [IncidentStatus.DRAFT]: 'Draft',
  [IncidentStatus.SUBMITTED]: 'Submitted',
  [IncidentStatus.UNDER_REVIEW]: 'Under Review',
  [IncidentStatus.APPROVED]: 'Approved',
  [IncidentStatus.REJECTED]: 'Rejected',
};
