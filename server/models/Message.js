/**
 * Message.js - Model for chat messages
 * Handles the structure and validation of chat messages
 */

class Message {
  constructor(data = {}) {
    this.content = data.message || '';
    this.previousMessages = data.previousMessages || [];
    this.files = data.files || {};
    this.timestamp = data.timestamp || new Date().toISOString();
  }

  /**
   * Validate if the message has valid content
   * @returns {Object} Validation result with isValid and errors
   */
  validate() {
    const errors = [];
    
    // Check if message has either text content or files
    if (!this.content && (!this.files || Object.keys(this.files).length === 0)) {
      errors.push({ 
        field: 'content', 
        message: 'Message must have either text content or attached files'
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Format a user message for OpenAI API
   * @param {Object} options - Formatting options
   * @returns {Object} Formatted message for OpenAI API
   */
  formatUserMessage(options = {}) {
    const { imageFile, voiceFile, req } = options;
    
    // Start with text content
    let userContent = this.content;
    
    // Handle image file if present
    if (imageFile) {
      const { getMimeType, fileToBase64 } = require('../utils/fileUtils');
      
      // For images, use multimodal format with content array
      userContent = [
        // Add text part if there is any
        ...(this.content ? [{ type: 'text', text: this.content }] : []),
        
        // Add image part
        {
          type: 'image_url',
          image_url: {
            url: `data:${getMimeType(imageFile.path)};base64,${fileToBase64(imageFile.path)}`,
            detail: 'high'
          }
        }
      ];
    }
    
    // Add voice reference if present
    if (voiceFile && req) {
      const voiceUrl = `${req.protocol}://${req.get('host')}/uploads/${voiceFile.filename}`;
      
      // Format depends on whether we already have an array or just text
      if (Array.isArray(userContent)) {
        // Find text entry or add new one
        const textIndex = userContent.findIndex(item => item.type === 'text');
        if (textIndex >= 0) {
          userContent[textIndex].text += `\n[Voice Recording available at: ${voiceUrl}]`;
        } else {
          userContent.unshift({
            type: 'text',
            text: `[Voice Recording available at: ${voiceUrl}]`
          });
        }
      } else {
        // Append voice info to text content
        userContent = userContent + `\n[Voice Recording available at: ${voiceUrl}]`;
      }
    }
    
    return {
      role: 'user',
      content: userContent
    };
  }
  
  /**
   * Format response for the client
   * @param {Object} completionData - Data from OpenAI API response
   * @param {Object} options - Additional options for response formatting
   * @returns {Object} Formatted response for client
   */
  formatResponse(completionData, options = {}) {
    const { imageFile, voiceFile, req } = options;
    
    const response = {
      message: completionData.choices[0].message.content,
      timestamp: new Date().toISOString(),
      tokenUsage: completionData.usage ? {
        promptTokens: completionData.usage.prompt_tokens,
        completionTokens: completionData.usage.completion_tokens,
        totalTokens: completionData.usage.total_tokens
      } : null
    };
    
    // Include image URL if available
    if (imageFile && req) {
      response.imageUrl = `${req.protocol}://${req.get('host')}/uploads/${imageFile.filename}`;
    }
    
    // Include voice URL if available
    if (voiceFile && req) {
      response.voiceUrl = `${req.protocol}://${req.get('host')}/uploads/${voiceFile.filename}`;
    }
    
    return response;
  }
  
  /**
   * Prepare messages array for OpenAI API based on memory settings
   * @param {Object} config - Configuration with memory settings
   * @returns {Array} Array of messages for OpenAI API
   */
  prepareMessageContext(config) {
    let messages = [];
    
    // Add system message if configured
    if (config.includeSystemMessage && config.systemMessage) {
      messages.push({ role: 'system', content: config.systemMessage });
    }
    
    // Add conversation history based on memory mode
    if (config.memoryMode !== 'none' && this.previousMessages.length > 0) {
      let historyMessages = [...this.previousMessages];
      
      if (config.memoryMode === 'limited') {
        // For limited mode, only include the most recent N messages
        const limit = Math.min(config.memoryLimit * 2, historyMessages.length);
        historyMessages = historyMessages.slice(-limit);
      }
      
      // Add each message to the context
      messages = [...messages, ...historyMessages];
    }
    
    return messages;
  }
}

module.exports = Message;