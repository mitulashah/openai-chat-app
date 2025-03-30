/**
 * chatRoutes.js - Routes for chat message endpoints
 */
const express = require('express');
const ChatController = require('../controllers/chatController');
const upload = require('../middleware/upload');

const router = express.Router();

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Send a message to Azure OpenAI
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/ChatMessage'
 *     responses:
 *       200:
 *         description: AI response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatResponse'
 *       400:
 *         description: Azure OpenAI is not configured
 *       500:
 *         description: Server error
 */
router.post('/', 
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'voice', maxCount: 1 }
  ]), 
  ChatController.processMessage
);

module.exports = router;