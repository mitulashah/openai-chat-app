/**
 * index.js - Main server entry point
 * Initializes Express app with MVC architecture
 */
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const swaggerUi = require('swagger-ui-express');
const specs = require('../swagger');

// Import middleware
const loggingMiddleware = require('./middleware/logging');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Import routes
const routes = require('./routes');

// Import config and utils
const appConfig = require('./config');
const { cleanupOldFiles } = require('./utils/fileUtils');

// Initialize Express app
const app = express();
const port = appConfig.port;

// Apply middleware
app.use(loggingMiddleware);
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "AI Chat API Documentation"
}));

// Register routes
app.use('/api/health', routes.healthRoutes);
app.use('/api/config', routes.configRoutes);
app.use('/api/chat', routes.chatRoutes);

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Schedule file cleanup periodically
setInterval(() => {
  cleanupOldFiles('uploads', appConfig.fileCleanupHours);
}, 60 * 60 * 1000); // Run every hour

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`API documentation available at http://localhost:${port}/api-docs`);
  console.log(`Available endpoints:`);
  console.log(`  GET  /api/health - Check server health`);
  console.log(`  GET  /api/config - Get configuration`);
  console.log(`  POST /api/config - Update configuration`);
  console.log(`  POST /api/chat   - Send a message to chat`);
});