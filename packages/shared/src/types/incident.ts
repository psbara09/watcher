export enum IncidentStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum IncidentType {
  THEFT = 'theft',
  ASSAULT = 'assault',
  VANDALISM = 'vandalism',
  FRAUD = 'fraud',
  TRESPASS = 'trespass',
  ANTISOCIAL_BEHAVIOUR = 'antisocial_behaviour',
  OTHER = 'other',
}

export interface Incident {
  id: string;
  tenantId: string;
  timestamp: string;
  storeLocation: string;
  incidentType: IncidentType;
  suspectDetails: string;
  description: string;
  status: IncidentStatus;
  evidenceIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Evidence {
  id: string;
  incidentId: string;
  tenantId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  storagePath: string;
  uploadedAt: string;
}
