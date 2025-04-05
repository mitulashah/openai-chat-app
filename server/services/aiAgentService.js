/**
 * aiAgentService.js - Service for Azure AI Agent API integration
 */
const { AzureAIProjectsClient, KeyCredential } = require('@azure/ai-projects');
const { config } = require('../models/Config');
const { MCPClientManager } = require('../../client/src/services/mcp/mcpClientManager');

// Create a dedicated MCP client manager for the AI Agent
const mcpClientManager = new MCPClientManager();

/**
 * Service for interacting with Azure AI Agent service
 */
class AIAgentService {
  /**
   * Initialize Azure AI Agent client
   * @returns {AzureAIProjectsClient} Configured Azure AI Agent client
   */
  static createClient() {
    if (!config.isConfigured() || !config.useAiAgentService) {
      throw new Error('Azure AI Agent service is not configured');
    }

    return new AzureAIProjectsClient(
      config.aiAgentEndpoint,
      new KeyCredential(config.apiKey)
    );
  }

  /**
   * Create a thread for Azure AI Agent service
   * @returns {Promise<Object>} The created thread
   */
  static async createThread() {
    const client = this.createClient();
    
    // Create a new thread for the conversation
    return await client.agents.createThread({
      projectName: config.aiAgentProjectName
    });
  }

  /**
   * Setup MCP clients for tool calling
   * @param {Array<Object>} mcpServers - Array of MCP server configurations
   */
  static setupMCPClients(mcpServers) {
    // Clear existing clients
    mcpClientManager.getAllClients().forEach(client => {
      mcpClientManager.removeClient(client.id);
    });
    
    // Add configured MCP servers
    if (Array.isArray(mcpServers)) {
      mcpServers.forEach(serverConfig => {
        if (serverConfig.id && serverConfig.url) {
          mcpClientManager.setClient(serverConfig.id, serverConfig);
        }
      });
    }
    
    // Initialize all clients
    return mcpClientManager.initializeAllClients();
  }

  /**
   * Handle agent tool calls using MCP clients
   * @param {Object} toolCalls - Tool calls from the Azure AI Agent
   * @returns {Promise<Array>} Results from tool execution
   */
  static async handleToolCalls(toolCalls) {
    if (!toolCalls || !Array.isArray(toolCalls)) {
      return [];
    }
    
    const toolResults = [];
    
    for (const call of toolCalls) {
      // Format of name is typically "namespace.function_name"
      const [serverId, toolName] = call.name.split('.');
      
      try {
        // Extract parameters from the function call
        let parameters = {};
        if (call.arguments) {
          try {
            parameters = JSON.parse(call.arguments);
          } catch (e) {
            console.error('Failed to parse tool call arguments:', e);
          }
        }
        
        // Execute the tool via MCP
        const result = await mcpClientManager.executeTool(serverId, {
          name: toolName,
          parameters
        });
        
        toolResults.push({
          tool_call_id: call.id,
          role: "tool",
          name: call.name,
          content: JSON.stringify(result)
        });
      } catch (error) {
        console.error(`Error executing tool ${call.name}:`, error);
        
        // Add error result
        toolResults.push({
          tool_call_id: call.id,
          role: "tool",
          name: call.name,
          content: JSON.stringify({ 
            error: true, 
            message: error.message || "Tool execution failed" 
          })
        });
      }
    }
    
    return toolResults;
  }

  /**
   * Process a run and handle any tool calls
   * @param {Object} client - Azure AI Projects client
   * @param {string} projectName - Project name
   * @param {string} threadId - Thread ID
   * @param {string} runId - Run ID
   * @returns {Promise<Object>} Processed run with handled tool calls
   */
  static async processRun(client, projectName, threadId, runId) {
    let run = await client.agents.getRun({
      projectName,
      threadId,
      runId
    });
    
    // Poll until the run is completed or requires action
    while (run.status === 'queued' || run.status === 'in_progress') {
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms
      run = await client.agents.getRun({
        projectName,
        threadId,
        runId
      });
    }
    
    // If the run requires tool execution
    if (run.status === 'requires_action' && 
        run.requiredAction?.type === 'submit_tool_outputs' &&
        Array.isArray(run.requiredAction.submitToolOutputs.toolCalls)) {
      
      // Process tool calls
      const toolResults = await this.handleToolCalls(
        run.requiredAction.submitToolOutputs.toolCalls
      );
      
      // Submit tool outputs back to the agent
      await client.agents.submitToolOutputs({
        projectName,
        threadId,
        runId,
        toolOutputs: toolResults
      });
      
      // Continue processing the run after tool execution
      return this.processRun(client, projectName, threadId, runId);
    }
    
    return run;
  }

  /**
   * Send a message to Azure AI Agent service and get a response
   * @param {Array} messages - Array of message objects
   * @param {Array<Object>} [mcpServers=[]] - Array of MCP server configurations for tool calling
   * @returns {Promise<Object>} Agent response
   */
  static async processConversation(messages, mcpServers = []) {
    try {
      const client = this.createClient();
      
      // Setup MCP clients for tool calling if provided
      if (mcpServers && mcpServers.length > 0) {
        await this.setupMCPClients(mcpServers);
      }
      
      // Create a new thread for this conversation
      const thread = await this.createThread();

      // Add previous messages to the thread
      for (const msg of messages.slice(0, -1)) { // All except the last message
        await client.agents.createMessage({
          projectName: config.aiAgentProjectName,
          threadId: thread.id,
          role: msg.role,
          content: msg.content
        });
      }

      // Add the latest user message
      const latestMessage = messages[messages.length - 1];
      await client.agents.createMessage({
        projectName: config.aiAgentProjectName,
        threadId: thread.id,
        role: latestMessage.role,
        content: latestMessage.content
      });

      // Run the agent on the thread
      const initialRun = await client.agents.createRun({
        projectName: config.aiAgentProjectName,
        threadId: thread.id,
        agentId: config.aiAgentId,  // Changed from config.aiAgentName to config.aiAgentId
        temperature: config.temperature,
        topP: config.topP,
        maxTokens: config.maxTokens,
        // Include available tools based on MCP servers
        tools: await this.getAvailableTools()
      });
      
      // Process the run, handling any tool calls
      const completedRun = await this.processRun(
        client, 
        config.aiAgentProjectName, 
        thread.id, 
        initialRun.id
      );

      // Fetch all messages to get the agent's response
      const threadMessages = await client.agents.listMessages({
        projectName: config.aiAgentProjectName,
        threadId: thread.id
      });
      
      // Find the assistant message that was added last (the response)
      const assistantMessages = threadMessages.filter(msg => msg.role === 'assistant');
      const latestAssistantMessage = assistantMessages[assistantMessages.length - 1];

      // Format response to match the expected structure in the app
      return {
        choices: [{
          message: {
            content: latestAssistantMessage.content
          }
        }],
        usage: {
          prompt_tokens: completedRun.usage?.promptTokens || 0,
          completion_tokens: completedRun.usage?.completionTokens || 0,
          total_tokens: completedRun.usage?.totalTokens || 0
        }
      };
    } catch (error) {
      console.error('Azure AI Agent error:', error);
      throw error;
    }
  }
  
  /**
   * Get available tools from MCP servers
   * @returns {Promise<Array>} Available tools in Azure AI Agent format
   */
  static async getAvailableTools() {
    try {
      // Get tools from all MCP clients
      const mcpToolsResponses = await mcpClientManager.getToolsFromAll({});
      
      // Filter successful responses and transform to Azure AI Agent tool format
      const tools = [];
      
      mcpToolsResponses.forEach(response => {
        if (response.success && Array.isArray(response.tools)) {
          response.tools.forEach(tool => {
            // Create a function definition for each tool
            tools.push({
              type: "function",
              function: {
                name: `${response.id}.${tool.name}`,
                description: tool.description || "",
                parameters: {
                  type: "object",
                  properties: tool.parameters?.properties || {},
                  required: tool.parameters?.required || []
                }
              }
            });
          });
        }
      });
      
      return tools;
    } catch (error) {
      console.error('Error getting available tools:', error);
      return []; // Return empty tools array on error
    }
  }
}

module.exports = AIAgentService;