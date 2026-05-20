export enum VerificationStatus {
  PENDING_AI = 'pending_ai',
  AI_VALIDATED = 'ai_validated',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum ReviewDecision {
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface AIValidationResult {
  passed: boolean;
  confidenceScore: number;
  validatedAt: string;
}

export interface AnalystReview {
  analystId: string;
  decision: ReviewDecision;
  notes: string;
  reviewedAt: string;
}

export interface VerificationRecord {
  id: string;
  incidentId: string;
  tenantId: string;
  status: VerificationStatus;
  aiValidation: AIValidationResult | null;
  analystReview: AnalystReview | null;
  createdAt: string;
  updatedAt: string;
}

export interface VerificationHistory {
  id: string;
  verificationId: string;
  action: string;
  actor: string;
  details: Record<string, unknown> | null;
  createdAt: string;
}
