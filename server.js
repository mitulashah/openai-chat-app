const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Configuration, OpenAIApi } = require('openai');
const swaggerUi = require('swagger-ui-express');
const specs = require('./swagger');

const app = express();
const port = 3001;

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

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Swagger UI - moved before other routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "AI Chat API Documentation"
}));

// Configuration storage
let config = {
  apiKey: '',
  endpoint: '',
  deploymentName: '',
  temperature: 0.7,
  topP: 1,
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
    configured: !!config.apiKey && !!config.endpoint && !!config.deploymentName
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
  res.json(config);
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
  config = { ...config, ...req.body };
  res.json({ success: true });
});

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
app.post('/api/chat', upload.single('image'), async (req, res) => {
  try {
    if (!config.apiKey || !config.endpoint || !config.deploymentName) {
      return res.status(400).json({ error: 'Azure OpenAI is not configured' });
    }

    const openai = new OpenAIApi(
      new Configuration({
        apiKey: config.apiKey,
        basePath: config.endpoint,
      })
    );

    let messages = [{ role: 'user', content: req.body.message || '' }];

    // If an image was uploaded, add it to the message
    if (req.file) {
      const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      messages[0].content += `\n[Image: ${imageUrl}]`;
    }

    const completion = await openai.createChatCompletion({
      model: config.deploymentName,
      messages: messages,
      temperature: config.temperature,
      top_p: config.topP,
    });

    res.json({
      message: completion.data.choices[0].message.content,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
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
            });
          }
        });
      });
    });
  }
}, 60 * 60 * 1000); // Run every hour

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`API documentation available at http://localhost:${port}/api-docs`);
}); 