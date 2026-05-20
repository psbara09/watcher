import { Router } from 'express';
import { submit, getQueue, getById, getByIncidentId, review } from '../controllers/verification.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Auth middleware on all routes
router.use(authMiddleware);

/**
 * @swagger
 * /api/verification/submit:
 *   post:
 *     summary: Submit incident for verification (internal, from Incident Service)
 *     tags: [Verification]
 *     security:
 *       - bearerAuth: []
 */
router.post('/submit', submit);

/**
 * @swagger
 * /api/verification/queue:
 *   get:
 *     summary: Get analyst review queue
 *     tags: [Verification]
 *     security:
 *       - bearerAuth: []
 */
router.get('/queue', getQueue);

/**
 * @swagger
 * /api/verification/incident/{incidentId}:
 *   get:
 *     summary: Get verification by incident ID
 *     tags: [Verification]
 *     security:
 *       - bearerAuth: []
 */
router.get('/incident/:incidentId', getByIncidentId);

/**
 * @swagger
 * /api/verification/{id}:
 *   get:
 *     summary: Get verification details by ID
 *     tags: [Verification]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', getById);

/**
 * @swagger
 * /api/verification/{id}/review:
 *   post:
 *     summary: Submit analyst review decision
 *     tags: [Verification]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/review', review);

export default router;
