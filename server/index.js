const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const OpenAI = require('openai');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for image uploads
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
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

dotenv.config();

const app = express();
const port = process.env.PORT || 3002; // Changed from 3001 to 3002 to avoid port conflict

// Enhanced logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Request received`);
  console.log('Headers:', JSON.stringify(req.headers));
  
  // Log response after it's sent
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Response: ${res.statusCode} ${res.statusMessage} (${duration}ms)`);
  });
  
  next();
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

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
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    configured: Boolean(azureConfig.apiKey && azureConfig.endpoint && azureConfig.deploymentName)
  });
});

// Configuration endpoints
app.get('/api/config', (req, res) => {
  // Return masked API key for security
  const maskedConfig = {
    ...azureConfig,
    apiKey: azureConfig.apiKey ? '********' : '',
  };
  res.json(maskedConfig);
});

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
    systemMessage
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
  };
  
  console.log('Configuration updated successfully:', {
    endpoint: azureConfig.endpoint,
    deploymentName: azureConfig.deploymentName,
    memoryMode: azureConfig.memoryMode,
    memoryLimit: azureConfig.memoryLimit,
    includeSystemMessage: azureConfig.includeSystemMessage,
    // Don't log the API key for security
  });
  
  res.json({ 
    success: true,
    message: 'Configuration updated successfully' 
  });
});

// Chat endpoint with enhanced error logging
app.post('/api/chat', upload.single('image'), async (req, res) => {
  try {
    // Log the request details
    console.log('--- Chat Request Details ---');
    console.log('Request body:', req.body);
    console.log('File attached:', req.file ? `Yes (${req.file.originalname}, ${req.file.size} bytes)` : 'No');
    console.log('Content type:', req.get('Content-Type'));
    
    const message = req.body.message || '';
    const previousMessages = req.body.previousMessages ? JSON.parse(req.body.previousMessages) : [];
    
    // Validate the request
    if (!message && !req.file) {
      console.log('Error: No message or image provided');
      return res.status(400).json({ 
        error: 'No message or image provided',
        details: 'Please provide either a text message or an image' 
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

    // Prepare the current user message
    let userMessage = message;
    
    // Add image content if present
    if (req.file) {
      const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      console.log('Image URL:', imageUrl);
      
      // For standard models, we just mention the image
      userMessage += `\n[Image: ${imageUrl}]`;
    }

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

    // Finally, add the current user message
    messages.push({ role: 'user', content: userMessage });

    console.log('Memory mode:', azureConfig.memoryMode);
    console.log('Total messages being sent to OpenAI:', messages.length);

    // Call OpenAI API
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
    availableEndpoints: ['/api/health', '/api/config', '/api/chat']
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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Available endpoints:`);
  console.log(`  GET  /api/health - Check server health`);
  console.log(`  GET  /api/config - Get configuration`);
  console.log(`  POST /api/config - Update configuration`);
  console.log(`  POST /api/chat   - Send a message to chat`);
});