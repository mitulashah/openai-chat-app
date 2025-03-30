/**
 * configController.js - Controller for configuration endpoints
 */
const { config } = require('../models/Config');

/**
 * Controller for configuration endpoints
 */
class ConfigController {
  /**
   * Get current configuration
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static getConfig(req, res) {
    res.json(config.toSafeObject());
  }
  
  /**
   * Update configuration
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static updateConfig(req, res) {
    // Update the configuration with request body
    config.update(req.body);
    
    // Validate the updated configuration
    const validation = config.validate();
    
    // If validation fails, return with validation errors
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors
      });
    }
    
    // Log successful configuration update
    console.log('Configuration updated successfully:', {
      endpoint: config.endpoint,
      deploymentName: config.deploymentName,
      memoryMode: config.memoryMode,
      memoryLimit: config.memoryLimit,
      includeSystemMessage: config.includeSystemMessage,
      visionModel: config.visionModel,
      // Don't log the API key for security
    });
    
    // Return success response
    res.json({
      success: true,
      message: 'Configuration updated successfully'
    });
  }
}

module.exports = ConfigController;