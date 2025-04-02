/**
 * Chat Service - Handles API calls to the chat server
 */
import axios from 'axios';
import mcpClientManager from './mcp/mcpClient';

const API_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3002';

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
 * @param {Object|string} messageInput - Message object or string input
 * @param {File|Array} fileOrHistory - Image file or previous messages array
 * @param {File|Object} voiceOrOptions - Voice file or options object
 * @param {Array} [previousMessagesParam] - Previous messages for context (optional)
 * @returns {Promise<Object>} Promise with the response
 */
export const sendMessage = async (messageInput, fileOrHistory, voiceOrOptions, previousMessagesParam) => {
  try {
    // Handle different parameter patterns to support both:
    // 1. sendMessage(message, previousMessages, options)
    // 2. sendMessage(text, imageFile, voiceFile, previousMessages)
    
    let message, previousMessages, options = {};
    
    // Check if first parameter is a string (text input) or object (message)
    if (typeof messageInput === 'string') {
      // Pattern: sendMessage(text, imageFile, voiceFile, previousMessages)
      message = { message: messageInput };  // Use 'message' property for server compatibility
      
      // If second param is an array, it's the message history
      if (Array.isArray(fileOrHistory)) {
        previousMessages = fileOrHistory;
        options = voiceOrOptions || {};
      } else {
        // Otherwise it's files and the history is the 4th param
        options = {
          imageFile: fileOrHistory || null,
          voiceFile: voiceOrOptions || null
        };
        previousMessages = previousMessagesParam || [];
      }
    } else {
      // Pattern: sendMessage(message, previousMessages, options)
      // Convert from { text: input, role: 'user' } to { message: input }
      message = { message: messageInput.text };
      previousMessages = Array.isArray(fileOrHistory) ? fileOrHistory : [];
      options = typeof voiceOrOptions === 'object' ? voiceOrOptions : {};
    }

    // Validate message object to prevent bad requests
    if (!message || (typeof message === 'object' && !message.message)) {
      console.error('Invalid message format', message);
      throw new Error('Invalid message format: Message must contain content');
    }

    // First, try to get relevant context from MCP servers
    let mcpContext = [];
    try {
      const mcpResults = await mcpClientManager.getContextFromAll({
        messages: [...previousMessages, { role: 'user', content: message.message }], // Format for MCP
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

    // Convert client message format to server message format for previous messages
    const formattedPreviousMessages = previousMessages.map(msg => {
      // Convert from client format { id, text, sender } to OpenAI format { role, content }
      return {
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      };
    });

    console.log('Formatted previous messages:', formattedPreviousMessages.length);
    
    // Prepare data for the chat API
    const formData = new FormData();
    
    // Format the message properly for the server
    const messageToSend = {
      ...message,
      previousMessages: formattedPreviousMessages, // Use formatted messages
      mcpContext // Include MCP context with the message
    };
    
    console.log('Sending message to API:', {
      messageContent: message.message?.substring(0, 50) + '...',
      previousMessagesCount: formattedPreviousMessages.length,
      mcpContextCount: mcpContext.length
    });
    
    formData.append('message', JSON.stringify(messageToSend));
    
    // Append files if present
    if (options.imageFile) {
      console.log('Attaching image:', options.imageFile.name, options.imageFile.type);
      formData.append('image', options.imageFile);
    }
    
    if (options.voiceFile) {
      console.log('Attaching voice:', options.voiceFile.name, options.voiceFile.type);
      formData.append('voice', options.voiceFile);
    }
    
    // Log request details for debugging
    console.log(`Sending request to ${API_URL}/api/chat`);
    
    // Send to chat API
    const response = await axios.post(`${API_URL}/api/chat`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    // Enhanced error logging
    console.error('Error sending message:', error);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Server responded with error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
      
      // If we have detailed error information from the server, use it
      if (error.response.data && error.response.data.error) {
        throw new Error(`Server error: ${error.response.data.error} - ${error.response.data.details || ''}`);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      throw new Error('No response from server. Please check your network connection.');
    }
    
    // Pass the error along for handling by the component
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
    const response = await axios.post(`${API_URL}/api/config`, config);
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
