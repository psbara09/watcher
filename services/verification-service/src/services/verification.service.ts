import { v4 as uuidv4 } from 'uuid';
import { pool } from '../db';
import axios from 'axios';
import { config } from '../config';
import {
  VerificationRecord,
  VerificationStatus,
  VerificationHistory,
  ReviewDecision,
  IncidentStatus,
} from '@watcher/shared';

export async function initiateVerification(
  incidentId: string,
  tenantId: string,
  authToken: string
): Promise<VerificationRecord> {
  // Check if already exists (idempotent)
  const existing = await pool.query(
    'SELECT * FROM verification.verification_records WHERE incident_id = $1',
    [incidentId]
  );

  if (existing.rows.length > 0) {
    return mapRowToVerificationRecord(existing.rows[0]);
  }

  const id = uuidv4();

  // Create verification record
  await pool.query(
    `INSERT INTO verification.verification_records (id, incident_id, tenant_id, status)
     VALUES ($1, $2, $3, $4)`,
    [id, incidentId, tenantId, VerificationStatus.PENDING_AI]
  );

  // Record history
  await recordHistory(id, 'submitted', 'incident-service', { incidentId });

  // Run AI validation (mock)
  const record = await runAIValidation(id, incidentId, tenantId, authToken);
  return record;
}

async function runAIValidation(
  verificationId: string,
  incidentId: string,
  tenantId: string,
  authToken: string
): Promise<VerificationRecord> {
  // Mock AI: generate random confidence score between 0.75 and 0.98
  const confidenceScore = parseFloat((Math.random() * 0.23 + 0.75).toFixed(2));
  const now = new Date().toISOString();

  // Update record with AI results
  await pool.query(
    `UPDATE verification.verification_records 
     SET status = $1, ai_confidence_score = $2, ai_validated_at = $3, updated_at = NOW()
     WHERE id = $4`,
    [VerificationStatus.AI_VALIDATED, confidenceScore, now, verificationId]
  );

  // Record history
  await recordHistory(verificationId, 'ai_validated', 'system/ai', { confidenceScore });

  // Update incident status to "under_review"
  try {
    await axios.patch(
      `${config.services.incidentUrl}/api/incidents/${incidentId}/status`,
      { status: IncidentStatus.UNDER_REVIEW },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
  } catch (err) {
    console.error('Failed to update incident status:', err);
  }

  // Return updated record
  const result = await pool.query(
    'SELECT * FROM verification.verification_records WHERE id = $1',
    [verificationId]
  );

  return mapRowToVerificationRecord(result.rows[0]);
}

export async function getAnalystQueue(): Promise<VerificationRecord[]> {
  const result = await pool.query(
    `SELECT * FROM verification.verification_records 
     WHERE status IN ($1, $2)
     ORDER BY created_at ASC`,
    [VerificationStatus.AI_VALIDATED, VerificationStatus.IN_REVIEW]
  );

  return result.rows.map(mapRowToVerificationRecord);
}

export async function getVerificationById(id: string): Promise<VerificationRecord | null> {
  const result = await pool.query(
    'SELECT * FROM verification.verification_records WHERE id = $1',
    [id]
  );

  if (result.rows.length === 0) return null;
  return mapRowToVerificationRecord(result.rows[0]);
}

export async function getVerificationByIncidentId(incidentId: string): Promise<VerificationRecord | null> {
  const result = await pool.query(
    'SELECT * FROM verification.verification_records WHERE incident_id = $1',
    [incidentId]
  );

  if (result.rows.length === 0) return null;
  return mapRowToVerificationRecord(result.rows[0]);
}

export async function submitAnalystDecision(
  verificationId: string,
  decision: ReviewDecision,
  notes: string,
  analystId: string,
  analystUsername: string,
  token: string
): Promise<VerificationRecord> {
  // Get current record
  const current = await pool.query(
    'SELECT * FROM verification.verification_records WHERE id = $1',
    [verificationId]
  );

  if (current.rows.length === 0) {
    throw new Error('Verification record not found');
  }

  const record = current.rows[0];
  const currentStatus = record.status as VerificationStatus;

  // Validate status allows review
  if (currentStatus !== VerificationStatus.AI_VALIDATED && currentStatus !== VerificationStatus.IN_REVIEW) {
    throw new Error(`Cannot review in current status: ${currentStatus}`);
  }

  // Determine new verification status
  const newStatus = decision === ReviewDecision.APPROVED
    ? VerificationStatus.APPROVED
    : VerificationStatus.REJECTED;

  // Update record
  const now = new Date().toISOString();
  await pool.query(
    `UPDATE verification.verification_records 
     SET status = $1, analyst_id = $2, decision = $3, notes = $4, reviewed_at = $5, updated_at = NOW()
     WHERE id = $6`,
    [newStatus, analystId, decision, notes, now, verificationId]
  );

  // Record history
  await recordHistory(verificationId, `analyst_${decision}`, analystUsername, { notes });

  // Update incident status
  const incidentStatus = decision === ReviewDecision.APPROVED
    ? IncidentStatus.APPROVED
    : IncidentStatus.REJECTED;

  try {
    await axios.patch(
      `${config.services.incidentUrl}/api/incidents/${record.incident_id}/status`,
      { status: incidentStatus },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (err) {
    console.error('Failed to update incident status:', err);
  }

  // Return updated record
  const result = await pool.query(
    'SELECT * FROM verification.verification_records WHERE id = $1',
    [verificationId]
  );

  return mapRowToVerificationRecord(result.rows[0]);
}

export async function getVerificationHistory(verificationId: string): Promise<VerificationHistory[]> {
  const result = await pool.query(
    'SELECT * FROM verification.verification_history WHERE verification_id = $1 ORDER BY created_at ASC',
    [verificationId]
  );

  return result.rows.map(mapRowToHistory);
}

async function recordHistory(
  verificationId: string,
  action: string,
  actor: string,
  details: Record<string, unknown>
): Promise<void> {
  await pool.query(
    `INSERT INTO verification.verification_history (id, verification_id, action, actor, details)
     VALUES ($1, $2, $3, $4, $5)`,
    [uuidv4(), verificationId, action, actor, JSON.stringify(details)]
  );
}

function mapRowToVerificationRecord(row: Record<string, unknown>): VerificationRecord {
  return {
    id: row.id as string,
    incidentId: row.incident_id as string,
    tenantId: row.tenant_id as string,
    status: row.status as VerificationStatus,
    aiValidation: row.ai_confidence_score ? {
      passed: true,
      confidenceScore: parseFloat(row.ai_confidence_score as string),
      validatedAt: (row.ai_validated_at as Date)?.toISOString() || '',
    } : null,
    analystReview: row.analyst_id ? {
      analystId: row.analyst_id as string,
      decision: row.decision as ReviewDecision,
      notes: (row.notes as string) || '',
      reviewedAt: (row.reviewed_at as Date)?.toISOString() || '',
    } : null,
    createdAt: (row.created_at as Date).toISOString(),
    updatedAt: (row.updated_at as Date).toISOString(),
  };
}

function mapRowToHistory(row: Record<string, unknown>): VerificationHistory {
  return {
    id: row.id as string,
    verificationId: row.verification_id as string,
    action: row.action as string,
    actor: row.actor as string,
    details: row.details as Record<string, unknown> | null,
    createdAt: (row.created_at as Date).toISOString(),
  };
}
