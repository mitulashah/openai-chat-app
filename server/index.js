const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const OpenAI = require('openai');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const swaggerUi = require('swagger-ui-express');
const specs = require('../swagger');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3002;

// Configure multer for file uploads (both image and voice)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept image and audio files
    if (!file.mimetype.startsWith('image/') && !file.mimetype.startsWith('audio/')) {
      return cb(new Error('Only image and audio files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Enhanced logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Request received`);
  
  // Log response after it's sent
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Response: ${res.statusCode} ${res.statusMessage} (${duration}ms)`);
  });
  
  next();
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "AI Chat API Documentation"
}));

// In-memory storage for Azure OpenAI configuration
let azureConfig = {
  apiKey: process.env.AZURE_OPENAI_API_KEY || '',
  endpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
  deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || '',
  temperature: parseFloat(process.env.AZURE_OPENAI_TEMPERATURE) || 0.7,
  topP: parseFloat(process.env.AZURE_OPENAI_TOP_P) || 1,
  memoryMode: process.env.AZURE_OPENAI_MEMORY_MODE || 'limited',
  memoryLimit: parseInt(process.env.AZURE_OPENAI_MEMORY_LIMIT) || 6,
  includeSystemMessage: process.env.AZURE_OPENAI_INCLUDE_SYSTEM === 'true',
  systemMessage: process.env.AZURE_OPENAI_SYSTEM_MESSAGE || 'You are a helpful assistant.',
  // New property for vision models
  visionModel: process.env.AZURE_OPENAI_VISION_MODEL || '',
};

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
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    configured: Boolean(azureConfig.apiKey && azureConfig.endpoint && azureConfig.deploymentName)
  });
});

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
app.get('/api/config', (req, res) => {
  // Return masked API key for security
  const maskedConfig = {
    ...azureConfig,
    apiKey: azureConfig.apiKey ? '********' : '',
  };
  res.json(maskedConfig);
});

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
app.post('/api/config', (req, res) => {
  const { 
    apiKey, 
    endpoint, 
    deploymentName, 
    temperature, 
    topP,
    memoryMode,
    memoryLimit,
    includeSystemMessage,
    systemMessage,
    visionModel    // New parameter for vision model
  } = req.body;
  
  // Add validation
  if (apiKey !== undefined && apiKey.trim() === '' && 
      endpoint !== undefined && endpoint.trim() === '' && 
      deploymentName !== undefined && deploymentName.trim() === '') {
    return res.status(400).json({ 
      error: 'Missing required configuration fields',
      details: 'API Key, Endpoint, and Deployment Name are required'
    });
  }

  // Validate temperature and top_p when provided
  if (temperature !== undefined) {
    const temp = parseFloat(temperature);
    if (isNaN(temp) || temp < 0 || temp > 2) {
      return res.status(400).json({ 
        error: 'Invalid temperature value', 
        details: 'Temperature must be between 0 and 2' 
      });
    }
  }

  if (topP !== undefined) {
    const top = parseFloat(topP);
    if (isNaN(top) || top < 0 || top > 1) {
      return res.status(400).json({ 
        error: 'Invalid topP value',
        details: 'Top P must be between 0 and 1' 
      });
    }
  }

  // Validate memory settings
  if (memoryMode !== undefined && !['none', 'limited', 'full'].includes(memoryMode)) {
    return res.status(400).json({
      error: 'Invalid memory mode',
      details: 'Memory mode must be "none", "limited", or "full"'
    });
  }

  if (memoryLimit !== undefined) {
    const limit = parseInt(memoryLimit);
    if (isNaN(limit) || limit < 1 || limit > 20) {
      return res.status(400).json({
        error: 'Invalid memory limit',
        details: 'Memory limit must be between 1 and 20'
      });
    }
  }

  // Update configuration
  azureConfig = {
    apiKey: apiKey || azureConfig.apiKey,
    endpoint: endpoint || azureConfig.endpoint,
    deploymentName: deploymentName || azureConfig.deploymentName,
    temperature: temperature !== undefined ? parseFloat(temperature) : azureConfig.temperature,
    topP: topP !== undefined ? parseFloat(topP) : azureConfig.topP,
    memoryMode: memoryMode || azureConfig.memoryMode,
    memoryLimit: memoryLimit !== undefined ? parseInt(memoryLimit) : azureConfig.memoryLimit,
    includeSystemMessage: includeSystemMessage !== undefined ? includeSystemMessage : azureConfig.includeSystemMessage,
    systemMessage: systemMessage || azureConfig.systemMessage,
    visionModel: visionModel || azureConfig.visionModel, // Add vision model configuration
  };
  
  console.log('Configuration updated successfully:', {
    endpoint: azureConfig.endpoint,
    deploymentName: azureConfig.deploymentName,
    memoryMode: azureConfig.memoryMode,
    memoryLimit: azureConfig.memoryLimit,
    includeSystemMessage: azureConfig.includeSystemMessage,
    visionModel: azureConfig.visionModel,
    // Don't log the API key for security
  });
  
  res.json({ 
    success: true,
    message: 'Configuration updated successfully' 
  });
});

/**
 * Helper function to convert a file to base64
 */
function fileToBase64(filePath) {
  return fs.readFileSync(filePath, { encoding: 'base64' });
}

/**
 * Helper function to get MIME type based on file extension
 */
function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.bmp': 'image/bmp',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

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
app.post('/api/chat', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'voice', maxCount: 1 }
]), async (req, res) => {
  try {
    // Log the request details
    console.log('--- Chat Request Details ---');
    console.log('Request body:', req.body);
    console.log('Files attached:', req.files ? JSON.stringify(Object.keys(req.files)) : 'None');
    console.log('Content type:', req.get('Content-Type'));
    
    const message = req.body.message || '';
    const previousMessages = req.body.previousMessages ? JSON.parse(req.body.previousMessages) : [];
    
    // Validate the request
    if (!message && (!req.files || Object.keys(req.files).length === 0)) {
      console.log('Error: No message or file provided');
      return res.status(400).json({ 
        error: 'No message or file provided',
        details: 'Please provide either a text message, image, or voice recording' 
      });
    }
    
    if (!azureConfig.apiKey || !azureConfig.endpoint || !azureConfig.deploymentName) {
      console.log('Error: Azure OpenAI not configured');
      return res.status(400).json({ 
        error: 'Azure OpenAI not configured',
        details: 'Please configure Azure OpenAI in the settings' 
      });
    }

    // Initialize OpenAI client
    const client = new OpenAI({
      apiKey: azureConfig.apiKey,
      baseURL: `${azureConfig.endpoint}/openai/deployments/${azureConfig.deploymentName}`,
      defaultQuery: { 'api-version': '2023-05-15' },
      defaultHeaders: { 'api-key': azureConfig.apiKey },
    });

    console.log('OpenAI client initialized with deployment:', azureConfig.deploymentName);

    // Prepare messages array based on memory settings
    let messages = [];

    // Add system message if configured
    if (azureConfig.includeSystemMessage && azureConfig.systemMessage) {
      messages.push({ role: 'system', content: azureConfig.systemMessage });
    }

    // Add conversation history based on memory mode
    if (azureConfig.memoryMode !== 'none' && previousMessages.length > 0) {
      let historyMessages = [...previousMessages];
      
      if (azureConfig.memoryMode === 'limited') {
        // For limited mode, only include the most recent N messages
        const limit = Math.min(azureConfig.memoryLimit * 2, historyMessages.length);
        historyMessages = historyMessages.slice(-limit);
      }

      // Add each message to the context
      messages = [...messages, ...historyMessages];
    }

    // Prepare the current user message
    let userContent;

    // Check if there's an image to process
    if (req.files && req.files.image && req.files.image.length > 0) {
      const imageFile = req.files.image[0];
      
      // For images, we need to use the multimodal format with content array
      userContent = [
        // First add the text part if there is any
        ...(message ? [{ type: 'text', text: message }] : []),
        
        // Then add the image part
        {
          type: 'image_url',
          image_url: {
            url: `data:${getMimeType(imageFile.path)};base64,${fileToBase64(imageFile.path)}`,
            detail: 'high'
          }
        }
      ];
      
      // Save the URL for client access
      const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${imageFile.filename}`;
      console.log('Image URL for client:', imageUrl);
    } else {
      // If no image, just use the text message
      userContent = message;
    }

    // If a voice recording was uploaded, add it to the message as a text reference
    // (OpenAI doesn't directly process audio in the same way as images)
    if (req.files && req.files.voice && req.files.voice.length > 0) {
      const voiceFile = req.files.voice[0];
      const voiceUrl = `${req.protocol}://${req.get('host')}/uploads/${voiceFile.filename}`;
      console.log('Voice URL:', voiceUrl);
      
      // If userContent is an array (already has an image), add text about voice
      if (Array.isArray(userContent)) {
        // Find the text entry or add a new one
        const textIndex = userContent.findIndex(item => item.type === 'text');
        if (textIndex >= 0) {
          userContent[textIndex].text += `\n[Voice Recording available at: ${voiceUrl}]`;
        } else {
          userContent.unshift({
            type: 'text',
            text: `[Voice Recording available at: ${voiceUrl}]`
          });
        }
      } else {
        // If userContent is just text, append the voice info
        userContent = userContent + `\n[Voice Recording available at: ${voiceUrl}]`;
      }
    }

    // Finally, add the current user message
    messages.push({ role: 'user', content: userContent });

    console.log('Memory mode:', azureConfig.memoryMode);
    console.log('Total messages being sent to OpenAI:', messages.length);
    console.log('User message format:', Array.isArray(userContent) ? 'multimodal' : 'text');

    // Call OpenAI API with vision support if needed
    const completion = await client.chat.completions.create({
      model: azureConfig.deploymentName,
      messages: messages,
      temperature: azureConfig.temperature,
      top_p: azureConfig.topP,
      max_tokens: 800,
    });

    console.log('OpenAI response received');
    
    // Send the response back to the client
    const response = {
      message: completion.choices[0].message.content,
      timestamp: new Date().toISOString(),
      tokenUsage: completion.usage ? {
        promptTokens: completion.usage.prompt_tokens,
        completionTokens: completion.usage.completion_tokens,
        totalTokens: completion.usage.total_tokens
      } : null
    };
    
    // If an image was uploaded, include its URL in the response for the client
    if (req.files && req.files.image && req.files.image.length > 0) {
      const imageFile = req.files.image[0];
      response.imageUrl = `${req.protocol}://${req.get('host')}/uploads/${imageFile.filename}`;
    }
    
    // If a voice recording was uploaded, include its URL in the response
    if (req.files && req.files.voice && req.files.voice.length > 0) {
      const voiceFile = req.files.voice[0];
      response.voiceUrl = `${req.protocol}://${req.get('host')}/uploads/${voiceFile.filename}`;
    }
    
    res.json(response);
  } catch (error) {
    console.error('=== Chat API Error ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Log detailed OpenAI API error information
    if (error.response) {
      console.error('OpenAI API Error Status:', error.response.status);
      console.error('OpenAI API Error Data:', error.response.data);
      console.error('OpenAI API Error Headers:', error.response.headers);
    }
    
    // Send appropriate error response
    const statusCode = error.response?.status || 500;
    res.status(statusCode).json({ 
      error: 'Error processing chat request',
      message: error.message,
      details: error.response?.data || 'Internal server error'
    });
  }
});

// 404 handler - catch all undefined routes
app.use((req, res, next) => {
  console.error(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: 'Not Found',
    message: `The requested endpoint ${req.originalUrl} does not exist`,
    availableEndpoints: ['/api/health', '/api/config', '/api/chat', '/api-docs']
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Cleanup uploaded files periodically
setInterval(() => {
  const uploadDir = 'uploads';
  if (fs.existsSync(uploadDir)) {
    fs.readdir(uploadDir, (err, files) => {
      if (err) return console.error(err);

      const now = Date.now();
      files.forEach(file => {
        const filePath = path.join(uploadDir, file);
        fs.stat(filePath, (err, stats) => {
          if (err) return console.error(err);

          // Delete files older than 24 hours
          if (now - stats.mtime.getTime() > 24 * 60 * 60 * 1000) {
            fs.unlink(filePath, err => {
              if (err) console.error(err);
              else console.log(`Cleaned up old file: ${file}`);
            });
          }
        });
      });
    });
  }
}, 60 * 60 * 1000); // Run every hour

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`API documentation available at http://localhost:${port}/api-docs`);
  console.log(`Available endpoints:`);
  console.log(`  GET  /api/health - Check server health`);
  console.log(`  GET  /api/config - Get configuration`);
  console.log(`  POST /api/config - Update configuration`);
  console.log(`  POST /api/chat   - Send a message to chat`);
});