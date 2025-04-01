/**
 * Chat Service - Handles API calls to the chat server
 */
import axios from 'axios';
import mcpClientManager from './mcp/mcpClient';

const API_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001';

/**
 * Check if the API is configured properly
 * @returns {Promise<boolean>} Promise that resolves to true if configured, false otherwise
 */
export const checkConfiguration = async () => {
  try {
    const config = await getServerConfig();
    return Boolean(config && config.endpoint && config.deploymentName);
  } catch (error) {
    console.error('Error checking configuration:', error);
    return false;
  }
};

/**
 * Send a message and get a response
 * @param {Object} message - Message object
 * @param {Array} previousMessages - Previous messages for context
 * @param {Object} options - Additional options for the request
 * @returns {Promise<Object>} Promise with the response
 */
export const sendMessage = async (message, previousMessages = [], options = {}) => {
  try {
    // First, try to get relevant context from MCP servers
    let mcpContext = [];
    try {
      const mcpResults = await mcpClientManager.getContextFromAll({
        messages: [...previousMessages, message],
        parameters: {
          maxResults: 5,
          minRelevanceScore: 0.7
        }
      });

      // Filter successful results and extract context
      mcpContext = mcpResults
        .filter(result => result.success && result.data?.context)
        .map(result => ({
          role: 'system',
          content: `[MCP Context from ${result.source}]: ${result.data.context}`,
          source: result.source
        }));

      console.log(`Received context from ${mcpContext.length} MCP servers:`, 
        mcpContext.map(ctx => ctx.source).join(', '));
    } catch (mcpError) {
      console.error('Error fetching MCP context:', mcpError);
      // Continue without MCP context if there's an error
    }

    // Prepare data for the chat API
    const formData = new FormData();
    formData.append('message', JSON.stringify({
      ...message,
      mcpContext // Include MCP context with the message
    }));
    
    // Append files if present
    if (options.imageFile) {
      formData.append('image', options.imageFile);
    }
    
    if (options.voiceFile) {
      formData.append('voice', options.voiceFile);
    }
    
    // Send to chat API
    const response = await axios.post(`${API_URL}/api/chat`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Get configuration from the server
 * @returns {Promise<Object>} Promise with the configuration
 */
export const getServerConfig = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/config`);
    return response.data;
  } catch (error) {
    console.error('Error getting server config:', error);
    throw error;
  }
};

/**
 * Update configuration on the server
 * @param {Object} config - New configuration
 * @returns {Promise<Object>} Promise with the updated configuration
 */
export const updateServerConfig = async (config) => {
  try {
    const response = await axios.put(`${API_URL}/api/config`, config);
    return response.data;
  } catch (error) {
    console.error('Error updating server config:', error);
    throw error;
  }
};

/**
 * Update configuration on the server (alias for updateServerConfig for backward compatibility)
 * @param {Object} config - New configuration
 * @returns {Promise<Object>} Promise with the updated configuration
 */
export const updateConfig = updateServerConfig;
