/**
 * configRoutes.js - Routes for configuration endpoints
 */
const express = require('express');
const ConfigController = require('../controllers/configController');

const router = express.Router();

/**
 * @swagger
 * /api/config:
 *   get:
 *     summary: Get current Azure OpenAI configuration
 *     tags: [Configuration]
 *     responses:
 *       200:
 *         description: Current configuration
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Config'
 */
router.get('/', ConfigController.getConfig);

/**
 * @swagger
 * /api/config:
 *   post:
 *     summary: Update Azure OpenAI configuration
 *     tags: [Configuration]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Config'
 *     responses:
 *       200:
 *         description: Configuration updated successfully
 */
router.post('/', ConfigController.updateConfig);

module.exports = router;