/**
 * Config.js - Model for Azure AI service configuration
 * Manages the configuration for Azure OpenAI and Azure AI Agent services
 */

class Config {
  constructor(initialConfig = {}) {
    // Existing Azure OpenAI settings
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
    
    // Azure AI Agent service settings - simplified to essential fields only
    this.useAiAgentService = initialConfig.useAiAgentService !== undefined ? initialConfig.useAiAgentService : false;
    this.aiAgentEndpoint = initialConfig.aiAgentEndpoint || '';
    this.aiAgentProjectName = initialConfig.aiAgentProjectName || '';
    this.aiAgentId = initialConfig.aiAgentId || '';
    
    // Optional reference fields - not used in API calls
    this.aiAgentName = initialConfig.aiAgentName || '';
  }

  /**
   * Validate the configuration
   * @returns {Object} Validation result with isValid and errors
   */
  validate() {
    const errors = [];
    
    if (this.useAiAgentService) {
      // Validate Azure AI Agent service settings - only essential fields
      if (!this.aiAgentEndpoint) {
        errors.push({ field: 'aiAgentEndpoint', message: 'AI Agent Endpoint is required' });
      }
      
      if (!this.aiAgentProjectName) {
        errors.push({ field: 'aiAgentProjectName', message: 'AI Agent Project Name is required' });
      }
      
      if (!this.aiAgentId) {
        errors.push({ field: 'aiAgentId', message: 'AI Agent ID is required' });
      }
    } else {
      // Validate Azure OpenAI settings
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
    // Update existing Azure OpenAI settings
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
    
    // Update Azure AI Agent service settings
    if (newConfig.useAiAgentService !== undefined) {
      this.useAiAgentService = newConfig.useAiAgentService;
    }
    
    if (newConfig.aiAgentEndpoint !== undefined) {
      this.aiAgentEndpoint = newConfig.aiAgentEndpoint;
    }
    
    if (newConfig.aiAgentProjectName !== undefined) {
      this.aiAgentProjectName = newConfig.aiAgentProjectName;
    }
    
    if (newConfig.aiAgentId !== undefined) {
      this.aiAgentId = newConfig.aiAgentId;
    }

    if (newConfig.aiAgentName !== undefined) {
      this.aiAgentName = newConfig.aiAgentName;
    }
    
    return this;
  }
  
  /**
   * Check if the configuration is valid for API use
   * @returns {boolean} Whether configuration has required fields
   */
  isConfigured() {
    if (this.useAiAgentService) {
      return Boolean(this.aiAgentEndpoint && this.aiAgentProjectName && this.aiAgentId);
    }
    return Boolean(this.apiKey && this.endpoint && this.deploymentName);
  }
}

// Create the singleton instance from environment variables
const config = new Config({
  // Azure OpenAI settings
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
  
  // Azure AI Agent service settings
  useAiAgentService: process.env.USE_AI_AGENT_SERVICE === 'true',
  aiAgentEndpoint: process.env.AI_AGENT_ENDPOINT || '',
  aiAgentProjectName: process.env.AI_AGENT_PROJECT_NAME || '',
  aiAgentId: process.env.AI_AGENT_ID || '',
  aiAgentName: process.env.AI_AGENT_NAME || ''
});

module.exports = {
  Config,
  config
};