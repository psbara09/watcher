import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import {
  createIncident,
  listIncidentsByTenant,
  listIncidentsForAnalyst,
  getIncidentById,
  findIncidentAcrossSchemas,
  updateIncidentStatus,
  uploadEvidence,
  getEvidencePresignedUrl,
  getEvidenceByIncident,
} from '../services/incident.service';
import {
  UserRole,
  IncidentStatus,
  INCIDENT_TYPES,
  ALLOWED_EVIDENCE_TYPES,
  MAX_EVIDENCE_FILE_SIZE,
} from '@watcher/shared';

export async function create(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (req.role !== UserRole.STORE_STAFF) {
    res.status(403).json({ error: 'Forbidden', message: 'Only store staff can create incidents', statusCode: 403 });
    return;
  }

  const { timestamp, incidentType, suspectDetails, description } = req.body;

  if (!timestamp || !incidentType || !suspectDetails || !description) {
    res.status(400).json({ error: 'Validation failed', message: 'All fields are required', statusCode: 400 });
    return;
  }

  if (!INCIDENT_TYPES.includes(incidentType)) {
    res.status(400).json({ error: 'Validation failed', message: 'Invalid incident type', statusCode: 400 });
    return;
  }

  const incident = await createIncident(
    { timestamp, incidentType, suspectDetails, description },
    req.tenantId!,
    req.tenantSchemaName!,
    req.tenantSchemaName === 'store1' ? 'Store 1' : 'Store 2',
    req.headers.authorization?.substring(7) || ''
  );

  res.status(201).json(incident);
}

export async function list(req: AuthenticatedRequest, res: Response): Promise<void> {
  const statusFilter = req.query.status as IncidentStatus | undefined;

  let incidents;
  if (req.role === UserRole.FACEWATCH_ANALYST) {
    incidents = await listIncidentsForAnalyst(statusFilter);
  } else {
    incidents = await listIncidentsByTenant(req.tenantSchemaName!, req.tenantId!, statusFilter);
  }

  res.json({ incidents, total: incidents.length });
}

export async function getById(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;

  let incident;
  if (req.role === UserRole.FACEWATCH_ANALYST) {
    const found = await findIncidentAcrossSchemas(id);
    incident = found?.incident || null;
  } else {
    incident = await getIncidentById(id, req.tenantSchemaName!, req.tenantId!);
  }

  if (!incident) {
    res.status(404).json({ error: 'Not found', message: 'Incident not found', statusCode: 404 });
    return;
  }

  res.json(incident);
}

export async function patchStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    res.status(400).json({ error: 'Validation failed', message: 'Status is required', statusCode: 400 });
    return;
  }

  // Find the incident across schemas
  const found = await findIncidentAcrossSchemas(id);
  if (!found) {
    res.status(404).json({ error: 'Not found', message: 'Incident not found', statusCode: 404 });
    return;
  }

  try {
    const updated = await updateIncidentStatus(id, found.schema, status, req.username || 'system');
    res.json(updated);
  } catch (err) {
    const error = err as Error;
    res.status(400).json({ error: 'Validation failed', message: error.message, statusCode: 400 });
  }
}

export async function uploadEvidenceHandler(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (req.role !== UserRole.STORE_STAFF) {
    res.status(403).json({ error: 'Forbidden', message: 'Only store staff can upload evidence', statusCode: 403 });
    return;
  }

  const { id } = req.params;
  const file = req.file;

  if (!file) {
    res.status(400).json({ error: 'Validation failed', message: 'No file provided', statusCode: 400 });
    return;
  }

  if (!ALLOWED_EVIDENCE_TYPES.includes(file.mimetype)) {
    res.status(400).json({ error: 'Validation failed', message: 'File type not allowed', statusCode: 400 });
    return;
  }

  if (file.size > MAX_EVIDENCE_FILE_SIZE) {
    res.status(400).json({ error: 'Validation failed', message: 'File too large (max 50MB)', statusCode: 400 });
    return;
  }

  // Verify incident exists and belongs to tenant
  const incident = await getIncidentById(id, req.tenantSchemaName!, req.tenantId!);
  if (!incident) {
    res.status(404).json({ error: 'Not found', message: 'Incident not found', statusCode: 404 });
    return;
  }

  const evidence = await uploadEvidence(id, req.tenantId!, req.tenantSchemaName!, {
    buffer: file.buffer,
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
  });

  res.status(201).json({ evidence });
}

export async function getEvidence(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id, evidenceId } = req.params;

  let schemaName = req.tenantSchemaName;

  // Analysts can access any tenant's evidence
  if (req.role === UserRole.FACEWATCH_ANALYST) {
    const found = await findIncidentAcrossSchemas(id);
    if (!found) {
      res.status(404).json({ error: 'Not found', message: 'Incident not found', statusCode: 404 });
      return;
    }
    schemaName = found.schema;
  }

  const result = await getEvidencePresignedUrl(id, evidenceId, schemaName!);
  if (!result) {
    res.status(404).json({ error: 'Not found', message: 'Evidence not found', statusCode: 404 });
    return;
  }

  res.json(result);
}

export async function listEvidence(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;

  let schemaName = req.tenantSchemaName;

  if (req.role === UserRole.FACEWATCH_ANALYST) {
    const found = await findIncidentAcrossSchemas(id);
    if (!found) {
      res.status(404).json({ error: 'Not found', message: 'Incident not found', statusCode: 404 });
      return;
    }
    schemaName = found.schema;
  }

  const evidence = await getEvidenceByIncident(id, schemaName!);
  res.json({ evidence, total: evidence.length });
}
