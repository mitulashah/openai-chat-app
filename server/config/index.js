/**
 * index.js - Central configuration management
 * Initializes and exposes application configuration
 */
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Default configuration values
const config = {
  port: process.env.PORT || 3002,
  environment: process.env.NODE_ENV || 'development',
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  uploadLimitMB: parseInt(process.env.UPLOAD_LIMIT_MB) || 10,
  fileCleanupHours: parseInt(process.env.FILE_CLEANUP_HOURS) || 24,
  apiVersion: process.env.API_VERSION || '2023-05-15'
};

module.exports = config;