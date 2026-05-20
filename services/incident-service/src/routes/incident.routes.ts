import { Router } from 'express';
import multer from 'multer';
import { create, list, getById, patchStatus, uploadEvidenceHandler, getEvidence, listEvidence } from '../controllers/incident.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// All routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * /api/incidents:
 *   post:
 *     summary: Create a new incident
 *     tags: [Incidents]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', create);

/**
 * @swagger
 * /api/incidents:
 *   get:
 *     summary: List incidents (tenant-scoped for staff, cross-tenant for analysts)
 *     tags: [Incidents]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', list);

/**
 * @swagger
 * /api/incidents/{id}:
 *   get:
 *     summary: Get incident by ID
 *     tags: [Incidents]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', getById);

/**
 * @swagger
 * /api/incidents/{id}/status:
 *   patch:
 *     summary: Update incident status
 *     tags: [Incidents]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/status', patchStatus);

/**
 * @swagger
 * /api/incidents/{id}/evidence:
 *   post:
 *     summary: Upload evidence file
 *     tags: [Evidence]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/evidence', upload.single('file'), uploadEvidenceHandler);

/**
 * @swagger
 * /api/incidents/{id}/evidence:
 *   get:
 *     summary: List evidence for an incident
 *     tags: [Evidence]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id/evidence', listEvidence);

/**
 * @swagger
 * /api/incidents/{id}/evidence/{evidenceId}:
 *   get:
 *     summary: Get presigned URL for evidence file
 *     tags: [Evidence]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id/evidence/:evidenceId', getEvidence);

export default router;
