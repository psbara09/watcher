import { v4 as uuidv4 } from 'uuid';
import { pool } from '../db';
import { uploadFile, generatePresignedUrl } from './storage.service';
import axios from 'axios';
import { config } from '../config';
import {
  Incident,
  IncidentStatus,
  IncidentType,
  Evidence,
  CreateIncidentRequest,
  VALID_STATUS_TRANSITIONS,
  PRESIGNED_URL_EXPIRY,
} from '@watcher/shared';

export async function createIncident(
  data: CreateIncidentRequest,
  tenantId: string,
  tenantSchemaName: string,
  storeLocation: string,
  authToken: string
): Promise<Incident> {
  const id = uuidv4();
  const status = IncidentStatus.SUBMITTED;

  const result = await pool.query(
    `INSERT INTO ${tenantSchemaName}.incidents 
     (id, tenant_id, timestamp, store_location, incident_type, suspect_details, description, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [id, tenantId, data.timestamp, storeLocation, data.incidentType, data.suspectDetails, data.description, status]
  );

  const row = result.rows[0];

  // Record status history
  await pool.query(
    `INSERT INTO ${tenantSchemaName}.incident_status_history 
     (incident_id, previous_status, new_status, changed_by)
     VALUES ($1, NULL, $2, $3)`,
    [id, status, 'store_staff']
  );

  // Trigger verification
  try {
    await axios.post(`${config.services.verificationUrl}/api/verification/submit`, {
      incidentId: id,
      tenantId,
    }, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
  } catch (err) {
    console.error('Failed to trigger verification:', err);
  }

  return mapRowToIncident(row);
}

export async function listIncidentsByTenant(
  tenantSchemaName: string,
  tenantId: string,
  statusFilter?: IncidentStatus
): Promise<Incident[]> {
  let query = `SELECT * FROM ${tenantSchemaName}.incidents WHERE tenant_id = $1`;
  const params: unknown[] = [tenantId];

  if (statusFilter) {
    query += ' AND status = $2';
    params.push(statusFilter);
  }

  query += ' ORDER BY created_at DESC';

  const result = await pool.query(query, params);
  return result.rows.map(mapRowToIncident);
}

export async function listIncidentsForAnalyst(
  statusFilter?: IncidentStatus
): Promise<Incident[]> {
  const schemas = ['store1', 'store2'];
  const allIncidents: Incident[] = [];

  for (const schema of schemas) {
    let query = `SELECT * FROM ${schema}.incidents`;
    const params: unknown[] = [];

    if (statusFilter) {
      query += ' WHERE status = $1';
      params.push(statusFilter);
    }

    const result = await pool.query(query, params);
    allIncidents.push(...result.rows.map(mapRowToIncident));
  }

  // Sort by created_at ASC (FCFS)
  allIncidents.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  return allIncidents;
}

export async function getIncidentById(
  id: string,
  tenantSchemaName: string,
  tenantId?: string
): Promise<Incident | null> {
  let query = `SELECT * FROM ${tenantSchemaName}.incidents WHERE id = $1`;
  const params: unknown[] = [id];

  if (tenantId) {
    query += ' AND tenant_id = $2';
    params.push(tenantId);
  }

  const result = await pool.query(query, params);
  if (result.rows.length === 0) return null;
  return mapRowToIncident(result.rows[0]);
}

export async function findIncidentAcrossSchemas(id: string): Promise<{ incident: Incident; schema: string } | null> {
  const schemas = ['store1', 'store2'];

  for (const schema of schemas) {
    const result = await pool.query(`SELECT * FROM ${schema}.incidents WHERE id = $1`, [id]);
    if (result.rows.length > 0) {
      return { incident: mapRowToIncident(result.rows[0]), schema };
    }
  }

  return null;
}

export async function updateIncidentStatus(
  id: string,
  tenantSchemaName: string,
  newStatus: IncidentStatus,
  changedBy: string
): Promise<Incident | null> {
  // Get current incident
  const current = await pool.query(`SELECT * FROM ${tenantSchemaName}.incidents WHERE id = $1`, [id]);
  if (current.rows.length === 0) return null;

  const currentStatus = current.rows[0].status as IncidentStatus;

  // Validate transition
  const allowedTransitions = VALID_STATUS_TRANSITIONS[currentStatus];
  if (!allowedTransitions.includes(newStatus)) {
    throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
  }

  // Update status
  const result = await pool.query(
    `UPDATE ${tenantSchemaName}.incidents SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [newStatus, id]
  );

  // Record history
  await pool.query(
    `INSERT INTO ${tenantSchemaName}.incident_status_history 
     (incident_id, previous_status, new_status, changed_by)
     VALUES ($1, $2, $3, $4)`,
    [id, currentStatus, newStatus, changedBy]
  );

  return mapRowToIncident(result.rows[0]);
}

export async function uploadEvidence(
  incidentId: string,
  tenantId: string,
  tenantSchemaName: string,
  file: { buffer: Buffer; originalname: string; mimetype: string; size: number }
): Promise<Evidence> {
  const evidenceId = uuidv4();
  const storagePath = `evidence/${tenantSchemaName}/${incidentId}/${evidenceId}_${file.originalname}`;

  // Upload to MinIO
  await uploadFile(storagePath, file.buffer, file.mimetype);

  // Save reference in DB
  const result = await pool.query(
    `INSERT INTO ${tenantSchemaName}.evidence 
     (id, incident_id, tenant_id, file_name, file_type, file_size, storage_path)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [evidenceId, incidentId, tenantId, file.originalname, file.mimetype, file.size, storagePath]
  );

  return mapRowToEvidence(result.rows[0]);
}

export async function getEvidencePresignedUrl(
  incidentId: string,
  evidenceId: string,
  tenantSchemaName: string
): Promise<{ presignedUrl: string; expiresIn: number } | null> {
  const result = await pool.query(
    `SELECT * FROM ${tenantSchemaName}.evidence WHERE id = $1 AND incident_id = $2`,
    [evidenceId, incidentId]
  );

  if (result.rows.length === 0) return null;

  const storagePath = result.rows[0].storage_path;
  const presignedUrl = await generatePresignedUrl(storagePath);

  return { presignedUrl, expiresIn: PRESIGNED_URL_EXPIRY };
}

export async function getEvidenceByIncident(
  incidentId: string,
  tenantSchemaName: string
): Promise<Evidence[]> {
  const result = await pool.query(
    `SELECT * FROM ${tenantSchemaName}.evidence WHERE incident_id = $1 ORDER BY uploaded_at ASC`,
    [incidentId]
  );

  return result.rows.map(mapRowToEvidence);
}

function mapRowToIncident(row: Record<string, unknown>): Incident {
  return {
    id: row.id as string,
    tenantId: row.tenant_id as string,
    timestamp: (row.timestamp as Date).toISOString(),
    storeLocation: row.store_location as string,
    incidentType: row.incident_type as IncidentType,
    suspectDetails: row.suspect_details as string,
    description: row.description as string,
    status: row.status as IncidentStatus,
    evidenceIds: [],
    createdAt: (row.created_at as Date).toISOString(),
    updatedAt: (row.updated_at as Date).toISOString(),
  };
}

function mapRowToEvidence(row: Record<string, unknown>): Evidence {
  return {
    id: row.id as string,
    incidentId: row.incident_id as string,
    tenantId: row.tenant_id as string,
    fileName: row.file_name as string,
    fileType: row.file_type as string,
    fileSize: row.file_size as number,
    storagePath: row.storage_path as string,
    uploadedAt: (row.uploaded_at as Date).toISOString(),
  };
}
