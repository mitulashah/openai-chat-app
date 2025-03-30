/**
 * openaiService.js - Service for OpenAI API integration
 */
const OpenAI = require('openai');
const { config } = require('../models/Config');

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
      throw new Error('Azure OpenAI is not configured');
    }
    
    return new OpenAI({
      apiKey: config.apiKey,
      baseURL: `${config.endpoint}/openai/deployments/${config.deploymentName}`,
      defaultQuery: { 'api-version': config.apiVersion },
      defaultHeaders: { 'api-key': config.apiKey },
    });
  }
  
  /**
   * Send a completion request to OpenAI
   * @param {Array} messages - Array of message objects
   * @returns {Promise<Object>} OpenAI API response
   */
  static async createCompletion(messages) {
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