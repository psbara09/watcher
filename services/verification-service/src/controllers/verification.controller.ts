import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import {
  initiateVerification,
  getAnalystQueue,
  getVerificationById,
  getVerificationByIncidentId,
  submitAnalystDecision,
  getVerificationHistory,
} from '../services/verification.service';
import { UserRole, ReviewDecision } from '@watcher/shared';

export async function submit(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { incidentId, tenantId } = req.body;

  if (!incidentId || !tenantId) {
    res.status(400).json({ error: 'Validation failed', message: 'incidentId and tenantId are required', statusCode: 400 });
    return;
  }

  const token = req.headers.authorization?.substring(7) || '';
  const record = await initiateVerification(incidentId, tenantId, token);
  res.status(201).json(record);
}

export async function getQueue(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (req.role !== UserRole.FACEWATCH_ANALYST) {
    res.status(403).json({ error: 'Forbidden', message: 'Only analysts can access the queue', statusCode: 403 });
    return;
  }

  const items = await getAnalystQueue();
  res.json({ items, total: items.length });
}

export async function getById(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (req.role !== UserRole.FACEWATCH_ANALYST) {
    res.status(403).json({ error: 'Forbidden', message: 'Only analysts can view verification details', statusCode: 403 });
    return;
  }

  const { id } = req.params;
  const record = await getVerificationById(id);

  if (!record) {
    res.status(404).json({ error: 'Not found', message: 'Verification record not found', statusCode: 404 });
    return;
  }

  const history = await getVerificationHistory(id);
  res.json({ ...record, history });
}

export async function getByIncidentId(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { incidentId } = req.params;
  const record = await getVerificationByIncidentId(incidentId);

  if (!record) {
    res.status(404).json({ error: 'Not found', message: 'Verification record not found', statusCode: 404 });
    return;
  }

  const history = await getVerificationHistory(record.id);
  res.json({ ...record, history });
}

export async function review(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (req.role !== UserRole.FACEWATCH_ANALYST) {
    res.status(403).json({ error: 'Forbidden', message: 'Only analysts can review incidents', statusCode: 403 });
    return;
  }

  const { id } = req.params;
  const { decision, notes } = req.body;

  if (!decision || !Object.values(ReviewDecision).includes(decision)) {
    res.status(400).json({ error: 'Validation failed', message: 'Valid decision (approved/rejected) is required', statusCode: 400 });
    return;
  }

  try {
    const token = req.headers.authorization?.substring(7) || '';
    const record = await submitAnalystDecision(
      id,
      decision,
      notes || '',
      req.userId!,
      req.username!,
      token
    );
    res.json(record);
  } catch (err) {
    const error = err as Error;
    res.status(400).json({ error: 'Validation failed', message: error.message, statusCode: 400 });
  }
}
