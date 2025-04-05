/**
 * MCPRestClient - REST API implementation of the MCP client
 * 
 * This class implements the MCP client using REST endpoints:
 * - Provides a fallback for servers that don't fully support JSON-RPC
 * - Handles REST-specific error handling
 * - Implements simplified initialization flow
 */

import { MCPClientBase } from './MCPClientBase.js';
import { MCP_ERROR_CODES, MCPError } from './mcpErrors.js';

/**
 * MCP REST API Client Implementation
 */
export class MCPRestClient extends MCPClientBase {
  /**
   * Initialize the client connection with the server
   * @returns {Promise<Object>} Whether initialization succeeded
   */
  async initialize() {
    return await this._handleRequest('initialize', async () => {
      if (this.initialized) {
        return true;
      }

      console.log(`Initializing REST MCP client for ${this.name}...`);
      
      try {
        // Get capabilities to test connection
        const capabilities = await this.getCapabilities();
        this.serverCapabilities = capabilities.data || {};
        
        this.initialized = true;
        console.log(`REST MCP client ${this.name} initialized with capabilities:`, this.serverCapabilities);
        return true;
      } catch (error) {
        console.error(`Failed to initialize REST MCP client ${this.name}:`, error);
        return false;
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
          `REST MCP client ${this.name} not initialized`
        );
      }
      
      const { messages = [], parameters = {} } = options;
      const resourceUri = options.resource?.uri || "chat://conversation";
      
      const response = await this.client.post('/context', {
        resource: { uri: resourceUri },
        messages,
        parameters
      });
      
      return response.data;
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
          `REST MCP client ${this.name} not initialized`
        );
      }
      
      // Check if server supports prompts capability
      if (!this.serverCapabilities?.prompts) {
        throw new MCPError(
          MCP_ERROR_CODES.MethodNotFound,
          `REST MCP server ${this.name} does not support prompts capability`
        );
      }
      
      const { messages = [], parameters = {} } = options;
      
      const response = await this.client.post('/prompts', {
        messages,
        parameters
      });
      
      return response.data;
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
          `REST MCP client ${this.name} not initialized`
        );
      }
      
      // Check if server supports tools capability
      if (!this.serverCapabilities?.tools) {
        throw new MCPError(
          MCP_ERROR_CODES.MethodNotFound,
          `REST MCP server ${this.name} does not support tools capability`
        );
      }
      
      const { toolId, parameters = {}, context = {} } = options;
      
      if (!toolId) {
        throw new MCPError(
          MCP_ERROR_CODES.InvalidParams,
          `Tool ID is required for executeTool`
        );
      }
      
      const response = await this.client.post(`/tools/${encodeURIComponent(toolId)}/execute`, {
        parameters,
        context
      });
      
      return response.data;
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
          `REST MCP client ${this.name} not initialized`
        );
      }
      
      // Check if server supports tools capability
      if (!this.serverCapabilities?.tools) {
        throw new MCPError(
          MCP_ERROR_CODES.MethodNotFound,
          `REST MCP server ${this.name} does not support tools capability`
        );
      }
      
      const { parameters = {} } = options;
      
      // Add parameters as query string if provided
      const queryParams = new URLSearchParams();
      Object.entries(parameters).forEach(([key, value]) => {
        queryParams.append(key, value);
      });
      
      const queryString = queryParams.toString();
      const url = queryString ? `/tools?${queryString}` : '/tools';
      
      const response = await this.client.get(url);
      
      return response.data;
    });
  }

  /**
   * Check the health/status of the MCP server
   * @returns {Promise<Object>} Health check response
   */
  async checkHealth() {
    return await this._handleRequest('health', async () => {
      const response = await this.client.get('/health');
      return {
        status: 'healthy',
        details: response.data,
        timestamp: new Date().toISOString()
      };
    });
  }

  /**
   * Get capabilities of the MCP server
   * @returns {Promise<Object>} Capabilities response
   */
  async getCapabilities() {
    return await this._handleRequest('getCapabilities', async () => {
      const response = await this.client.get('/capabilities');
      return response.data;
    });
  }
}