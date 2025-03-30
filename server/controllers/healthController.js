/**
 * healthController.js - Controller for health check endpoint
 */
const { config } = require('../models/Config');

/**
 * Controller for health check endpoint
 */
class HealthController {
  /**
   * Get server health status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static getHealth(req, res) {
    res.json({
      status: 'ok',
      configured: config.isConfigured(),
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = HealthController;