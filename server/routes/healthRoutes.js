/**
 * healthRoutes.js - Routes for health check endpoint
 */
const express = require('express');
const HealthController = require('../controllers/healthController');

const router = express.Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Check server health and configuration status
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Server health status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheck'
 */
router.get('/', HealthController.getHealth);

module.exports = router;