/**
 * MCPJsonRpcClient - JSON-RPC implementation of the MCP client
 * 
 * This class implements the MCP client using JSON-RPC protocol:
 * - Sends requests using JSON-RPC 2.0 format
 * - Handles JSON-RPC specific error handling
 * - Implements the initialization flow with fallbacks
 */

import { MCPClientBase } from './MCPClientBase';
import { MCP_ERROR_CODES, MCPError } from './mcpErrors';
import { createJsonRpcRequest, createJsonRpcNotification } from './jsonRpc';

/**
 * MCP JSON-RPC Client Implementation
 */
export class MCPJsonRpcClient extends MCPClientBase {
  /**
   * Send a JSON-RPC request to the server
   * @param {string} method - Method name
   * @param {Object} params - Request parameters
   * @returns {Promise<Object>} Response data
   * @private
   */
  async _sendJsonRpcRequest(method, params = {}) {
    const request = createJsonRpcRequest(method, params);
    const response = await this.client.post('/', request);
    
    if (response.data.error) {
      throw new MCPError(
        response.data.error.code || MCP_ERROR_CODES.InternalError,
        response.data.error.message || `Error in ${method}`,
        response.data.error.data
      );
    }
    
    return response.data.result;
  }

  /**
   * Send a JSON-RPC notification to the server (no response expected)
   * @param {string} method - Method name
   * @param {Object} params - Notification parameters
   * @returns {Promise<void>}
   * @private
   */
  async _sendJsonRpcNotification(method, params = {}) {
    const notification = createJsonRpcNotification(method, params);
    await this.client.post('/', notification);
  }

  /**
   * Initialize the client connection with the server
   * @returns {Promise<boolean>} Whether initialization succeeded
   */
  async initialize() {
    return await this._handleRequest('initialize', async () => {
      if (this.initialized) {
        console.log(`MCP client ${this.name} already initialized`);
        return true;
      }

      console.log(`Initializing MCP client for ${this.name}...`);
      
      // Step 1: Send initialize request with client capabilities
      const initializeParams = {
        clientInfo: {
          name: "OpenAI Chat App MCP Client",
          version: "1.0.0"
        },
        capabilities: {
          resources: true,
          prompts: true,  // Now supporting prompts feature
          tools: true     // Now supporting tools feature
        }
      };
      
      try {
        // Try to initialize using JSON-RPC
        const result = await this._sendJsonRpcRequest('initialize', initializeParams);
        this.serverCapabilities = result.capabilities || {};
        
        // Step 2: Send initialized notification
        await this._sendJsonRpcNotification('initialized', {});
        
        this.initialized = true;
        console.log(`MCP client ${this.name} initialized successfully with capabilities:`, this.serverCapabilities);
        return true;
      } catch (jsonRpcError) {
        console.warn(`JSON-RPC initialization failed for ${this.name}, assuming legacy server:`, jsonRpcError);
        
        // Fall back to capabilities endpoint for legacy servers
        try {
          const capabilities = await this.getCapabilities();
          this.serverCapabilities = capabilities.data || capabilities;
          this.initialized = true;
          console.log(`MCP client ${this.name} initialized with legacy capabilities:`, this.serverCapabilities);
          return true;
        } catch (legacyError) {
          console.error(`Legacy initialization failed for ${this.name}:`, legacyError);
          return false;
        }
      }
    });
  }

  /**
   * Get context for a message from the MCP server
   * @param {Object} options - Request options
   * @param {Array} options.messages - Array of messages in the conversation
   * @param {Object} options.parameters - Additional parameters for the request
   * @returns {Promise<Object>} Context response
   */
  async getContext(options = {}) {
    return await this._handleRequest('getContext', async () => {
      // Ensure client is initialized before making request
      if (!await this._ensureInitialized()) {
        throw new MCPError(
          MCP_ERROR_CODES.ServerNotInitialized,
          `MCP client ${this.name} not initialized`
        );
      }
      
      const { messages = [], parameters = {} } = options;
      
      // Use resource URI if not specified
      const resourceUri = options.resource?.uri || "chat://conversation";
      
      // Create request parameters according to MCP spec
      const params = {
        resource: { uri: resourceUri },
        messages,
        parameters
      };
      
      // Use JSON-RPC format for the request
      return await this._sendJsonRpcRequest('getContext', params);
    });
  }

  /**
   * Get prompt suggestions from the MCP server
   * @param {Object} options - Request options
   * @param {Array} options.messages - Array of messages in the conversation
   * @param {Object} options.parameters - Additional parameters for the request
   * @returns {Promise<Object>} Prompts response
   */
  async getPrompts(options = {}) {
    return await this._handleRequest('getPrompts', async () => {
      // Ensure client is initialized before making request
      if (!await this._ensureInitialized()) {
        throw new MCPError(
          MCP_ERROR_CODES.ServerNotInitialized,
          `MCP client ${this.name} not initialized`
        );
      }
      
      // Check if server supports prompts capability
      if (!this.serverCapabilities?.prompts) {
        throw new MCPError(
          MCP_ERROR_CODES.MethodNotFound,
          `MCP server ${this.name} does not support prompts capability`
        );
      }
      
      const { messages = [], parameters = {} } = options;
      
      // Create request parameters according to MCP spec
      const params = {
        messages,
        parameters
      };
      
      // Use JSON-RPC format for the request
      return await this._sendJsonRpcRequest('getPrompts', params);
    });
  }

  /**
   * Execute a tool via the MCP server
   * @param {Object} options - Request options
   * @param {string} options.toolId - The ID of the tool to execute
   * @param {Object} options.parameters - Tool parameters
   * @returns {Promise<Object>} Tool execution response
   */
  async executeTool(options = {}) {
    return await this._handleRequest('executeTool', async () => {
      // Ensure client is initialized before making request
      if (!await this._ensureInitialized()) {
        throw new MCPError(
          MCP_ERROR_CODES.ServerNotInitialized,
          `MCP client ${this.name} not initialized`
        );
      }
      
      // Check if server supports tools capability
      if (!this.serverCapabilities?.tools) {
        throw new MCPError(
          MCP_ERROR_CODES.MethodNotFound,
          `MCP server ${this.name} does not support tools capability`
        );
      }
      
      const { toolId, parameters = {}, context = {} } = options;
      
      if (!toolId) {
        throw new MCPError(
          MCP_ERROR_CODES.InvalidParams,
          `Tool ID is required for executeTool`
        );
      }
      
      // Create request parameters according to MCP spec
      const params = {
        toolId,
        parameters,
        context
      };
      
      // Use JSON-RPC format for the request
      return await this._sendJsonRpcRequest('executeTool', params);
    });
  }

  /**
   * Get available tools from the MCP server
   * @param {Object} options - Request options
   * @param {Object} options.parameters - Additional parameters for the request
   * @returns {Promise<Object>} Available tools response
   */
  async getTools(options = {}) {
    return await this._handleRequest('getTools', async () => {
      // Ensure client is initialized before making request
      if (!await this._ensureInitialized()) {
        throw new MCPError(
          MCP_ERROR_CODES.ServerNotInitialized,
          `MCP client ${this.name} not initialized`
        );
      }
      
      // Check if server supports tools capability
      if (!this.serverCapabilities?.tools) {
        throw new MCPError(
          MCP_ERROR_CODES.MethodNotFound,
          `MCP server ${this.name} does not support tools capability`
        );
      }
      
      const { parameters = {} } = options;
      
      // Create request parameters according to MCP spec
      const params = { parameters };
      
      // Use JSON-RPC format for the request
      return await this._sendJsonRpcRequest('getTools', params);
    });
  }

  /**
   * Check the health/status of the MCP server
   * @returns {Promise<Object>} Health check response
   */
  async checkHealth() {
    return await this._handleRequest('health', async () => {
      // First try the JSON-RPC method
      try {
        const result = await this._sendJsonRpcRequest('health', {});
        return {
          status: 'healthy',
          details: result,
          timestamp: new Date().toISOString()
        };
      } catch (jsonRpcError) {
        // Fall back to REST API style
        const response = await this.client.get('/health');
        return {
          status: 'healthy',
          details: response.data,
          timestamp: new Date().toISOString()
        };
      }
    });
  }

  /**
   * Get capabilities of the MCP server
   * @returns {Promise<Object>} Capabilities response
   */
  async getCapabilities() {
    return await this._handleRequest('getCapabilities', async () => {
      // Try JSON-RPC format first
      try {
        return await this._sendJsonRpcRequest('getCapabilities', {});
      } catch (jsonRpcError) {
        // Fall back to REST API style
        const response = await this.client.get('/capabilities');
        return response.data;
      }
    });
  }
}