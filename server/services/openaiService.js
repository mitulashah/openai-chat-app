/**
 * openaiService.js - Service for OpenAI API integration
 * Provides a common interface for both Azure OpenAI and Azure AI Agent service
 */
const OpenAI = require('openai');
const { config } = require('../models/Config');
const AIAgentService = require('./aiAgentService');

/**
 * Service for interacting with OpenAI API
 */
class OpenAIService {
  /**
   * Initialize OpenAI client with provided configuration
   * @returns {OpenAI} Configured OpenAI client
   */
  static createClient() {
    if (!config.isConfigured()) {
      throw new Error('AI service is not configured');
    }
    
    // Don't create OpenAI client if we're using AI Agent service
    if (config.useAiAgentService) {
      return null;
    }
    
    return new OpenAI({
      apiKey: config.apiKey,
      baseURL: `${config.endpoint}/openai/deployments/${config.deploymentName}`,
      defaultQuery: { 'api-version': config.apiVersion },
      defaultHeaders: { 'api-key': config.apiKey },
    });
  }
  
  /**
   * Send a completion request to either Azure OpenAI or Azure AI Agent service
   * @param {Array} messages - Array of message objects
   * @returns {Promise<Object>} API response
   */
  static async createCompletion(messages) {
    // Check if we should use AI Agent service
    if (config.useAiAgentService) {
      console.log('Using Azure AI Agent service for completion');
      return await AIAgentService.processConversation(messages);
    }
    
    // Otherwise use standard Azure OpenAI
    console.log('Using Azure OpenAI service for completion');
    const client = this.createClient();
    
    return await client.chat.completions.create({
      model: config.deploymentName,
      messages: messages,
      temperature: config.temperature,
      top_p: config.topP,
      max_tokens: config.maxTokens,
    });
  }
}

module.exports = OpenAIService;