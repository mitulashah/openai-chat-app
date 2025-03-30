/**
 * Config.js - Model for Azure OpenAI configuration
 * Manages the configuration for the Azure OpenAI service
 */

class Config {
  constructor(initialConfig = {}) {
    this.apiKey = initialConfig.apiKey || '';
    this.endpoint = initialConfig.endpoint || '';
    this.deploymentName = initialConfig.deploymentName || '';
    this.temperature = initialConfig.temperature !== undefined ? initialConfig.temperature : 0.7;
    this.topP = initialConfig.topP !== undefined ? initialConfig.topP : 1;
    this.memoryMode = initialConfig.memoryMode || 'limited';
    this.memoryLimit = initialConfig.memoryLimit !== undefined ? initialConfig.memoryLimit : 6;
    this.includeSystemMessage = initialConfig.includeSystemMessage !== undefined ? 
      initialConfig.includeSystemMessage : false;
    this.systemMessage = initialConfig.systemMessage || 'You are a helpful assistant.';
    this.visionModel = initialConfig.visionModel || '';
    this.apiVersion = initialConfig.apiVersion || '2023-05-15';
    this.maxTokens = initialConfig.maxTokens !== undefined ? initialConfig.maxTokens : 800;
  }

  /**
   * Validate the configuration
   * @returns {Object} Validation result with isValid and errors
   */
  validate() {
    const errors = [];
    
    // Check required fields
    if (!this.apiKey) {
      errors.push({ field: 'apiKey', message: 'API Key is required' });
    }
    
    if (!this.endpoint) {
      errors.push({ field: 'endpoint', message: 'Endpoint is required' });
    }
    
    if (!this.deploymentName) {
      errors.push({ field: 'deploymentName', message: 'Deployment Name is required' });
    }
    
    // Validate temperature
    const temp = parseFloat(this.temperature);
    if (isNaN(temp) || temp < 0 || temp > 2) {
      errors.push({ 
        field: 'temperature', 
        message: 'Temperature must be between 0 and 2'
      });
    }
    
    // Validate top_p
    const topP = parseFloat(this.topP);
    if (isNaN(topP) || topP < 0 || topP > 1) {
      errors.push({ 
        field: 'topP', 
        message: 'Top P must be between 0 and 1'
      });
    }
    
    // Validate memory mode
    if (!['none', 'limited', 'full'].includes(this.memoryMode)) {
      errors.push({
        field: 'memoryMode',
        message: 'Memory mode must be "none", "limited", or "full"'
      });
    }
    
    // Validate memory limit
    const limit = parseInt(this.memoryLimit);
    if (isNaN(limit) || limit < 1 || limit > 20) {
      errors.push({
        field: 'memoryLimit',
        message: 'Memory limit must be between 1 and 20'
      });
    }
    
    // Validate API version
    if (!this.apiVersion) {
      errors.push({
        field: 'apiVersion',
        message: 'API version is required'
      });
    }
    
    // Validate max tokens
    const maxTokens = parseInt(this.maxTokens);
    if (isNaN(maxTokens) || maxTokens < 1 || maxTokens > 4000) {
      errors.push({
        field: 'maxTokens',
        message: 'Max tokens must be between 1 and 4000'
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Get the configuration with masked API key for security
   * @returns {Object} Masked configuration object
   */
  toSafeObject() {
    return {
      ...this,
      apiKey: this.apiKey ? '********' : '',
    };
  }
  
  /**
   * Update the configuration with new values
   * @param {Object} newConfig - New configuration values
   * @returns {Config} Updated config instance
   */
  update(newConfig) {
    if (newConfig.apiKey !== undefined) {
      this.apiKey = newConfig.apiKey;
    }
    
    if (newConfig.endpoint !== undefined) {
      this.endpoint = newConfig.endpoint;
    }
    
    if (newConfig.deploymentName !== undefined) {
      this.deploymentName = newConfig.deploymentName;
    }
    
    if (newConfig.temperature !== undefined) {
      this.temperature = parseFloat(newConfig.temperature);
    }
    
    if (newConfig.topP !== undefined) {
      this.topP = parseFloat(newConfig.topP);
    }
    
    if (newConfig.memoryMode !== undefined) {
      this.memoryMode = newConfig.memoryMode;
    }
    
    if (newConfig.memoryLimit !== undefined) {
      this.memoryLimit = parseInt(newConfig.memoryLimit);
    }
    
    if (newConfig.includeSystemMessage !== undefined) {
      this.includeSystemMessage = newConfig.includeSystemMessage;
    }
    
    if (newConfig.systemMessage !== undefined) {
      this.systemMessage = newConfig.systemMessage;
    }
    
    if (newConfig.visionModel !== undefined) {
      this.visionModel = newConfig.visionModel;
    }
    
    if (newConfig.apiVersion !== undefined) {
      this.apiVersion = newConfig.apiVersion;
    }
    
    if (newConfig.maxTokens !== undefined) {
      this.maxTokens = parseInt(newConfig.maxTokens);
    }
    
    return this;
  }
  
  /**
   * Check if the configuration is valid for API use
   * @returns {boolean} Whether configuration has required fields
   */
  isConfigured() {
    return Boolean(this.apiKey && this.endpoint && this.deploymentName);
  }
}

// Create the singleton instance from environment variables
const config = new Config({
  apiKey: process.env.AZURE_OPENAI_API_KEY || '',
  endpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
  deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || '',
  temperature: parseFloat(process.env.AZURE_OPENAI_TEMPERATURE) || 0.7,
  topP: parseFloat(process.env.AZURE_OPENAI_TOP_P) || 1,
  memoryMode: process.env.AZURE_OPENAI_MEMORY_MODE || 'limited',
  memoryLimit: parseInt(process.env.AZURE_OPENAI_MEMORY_LIMIT) || 6,
  includeSystemMessage: process.env.AZURE_OPENAI_INCLUDE_SYSTEM === 'true',
  systemMessage: process.env.AZURE_OPENAI_SYSTEM_MESSAGE || 'You are a helpful assistant.',
  visionModel: process.env.AZURE_OPENAI_VISION_MODEL || '',
  apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2023-05-15',
  maxTokens: parseInt(process.env.AZURE_OPENAI_MAX_TOKENS) || 800,
});

module.exports = {
  Config,
  config
};