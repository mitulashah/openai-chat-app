/**
 * chatController.js - Controller for chat message endpoints
 */
const Message = require('../models/Message');
const { config } = require('../models/Config');
const OpenAIService = require('../services/openaiService');
const AIAgentService = require('../services/aiAgentService');

/**
 * Controller for chat message endpoints
 */
class ChatController {
  /**
   * Process a chat message and get response from OpenAI
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  static async processMessage(req, res, next) {
    try {
      // Debug logging for incoming request
      console.log('Received chat request:', {
        hasMessage: !!req.body.message,
        hasImage: !!req.files?.image,
        hasVoice: !!req.files?.voice
      });

      // Check if message is present in request body
      if (!req.body.message) {
        return res.status(400).json({
          error: 'Missing message',
          details: 'Message field is required in the request body'
        });
      }

      // Parse message data from the request
      let messageData;
      try {
        messageData = JSON.parse(req.body.message);
        console.log('Parsed message data:', {
          hasMessageField: !!messageData.message,
          mcpContextLength: messageData.mcpContext?.length || 0,
          previousMessagesLength: messageData.previousMessages?.length || 0
        });
      } catch (parseError) {
        console.error('Error parsing message JSON:', parseError);
        return res.status(400).json({
          error: 'Invalid message format',
          details: 'Message must be valid JSON'
        });
      }
      
      // Create message instance
      const message = new Message(messageData);
      
      // Validate message
      const validation = message.validate();
      
      if (!validation.isValid) {
        return res.status(400).json({
          error: 'Invalid message',
          details: validation.errors[0].message
        });
      }
      
      // Check if Azure service is configured
      if (!config.isConfigured()) {
        return res.status(400).json({
          error: 'Azure service not configured',
          details: 'Please configure Azure OpenAI or AI Agent Service in the settings'
        });
      }
      
      // Prepare message context based on memory settings
      const messageContext = message.prepareMessageContext(config);
      
      // Extract files from request if present
      const imageFile = req.files?.image?.[0] || null;
      const voiceFile = req.files?.voice?.[0] || null;
      
      // Format user message with any files
      const userMessage = message.formatUserMessage({
        imageFile,
        voiceFile,
        req
      });
      
      // Add user message to context
      messageContext.push(userMessage);
      
      // Extract MCP servers and context
      let mcpServers = [];
      let mcpContext = [];
      
      if (messageData.mcpServers && Array.isArray(messageData.mcpServers)) {
        mcpServers = messageData.mcpServers;
      }
      
      if (messageData.mcpContext && Array.isArray(messageData.mcpContext)) {
        mcpContext = messageData.mcpContext;
        // Add MCP context messages to the context
        messageContext.push(...mcpContext);
        console.log(`Added ${mcpContext.length} MCP context messages from:`, 
          mcpContext.map(ctx => ctx.source).join(', '));
      }
      
      console.log('Memory mode:', config.memoryMode);
      console.log('Total messages being sent to AI service:', messageContext.length);
      console.log('User message format:', Array.isArray(userMessage.content) ? 'multimodal' : 'text');
      
      try {
        let completion;
        
        // Use appropriate service based on configuration
        if (config.useAiAgentService) {
          console.log('Using Azure AI Agent Service with MCP tool calling');
          completion = await AIAgentService.processConversation(messageContext, mcpServers);
        } else {
          console.log('Using Azure OpenAI Service');
          completion = await OpenAIService.createCompletion(messageContext);
        }
        
        // Format response for client
        const response = message.formatResponse(completion, {
          imageFile,
          voiceFile,
          req
        });
        
        // Return response
        res.json(response);
      } catch (apiError) {
        console.error('AI service API error:', apiError.message);
        if (apiError.response) {
          console.error('API response:', apiError.response.data);
        }
        throw apiError; // Let the error handler middleware handle this
      }
    } catch (error) {
      console.error('Chat controller error:', error.message);
      next(error);
    }
  }
}

module.exports = ChatController;