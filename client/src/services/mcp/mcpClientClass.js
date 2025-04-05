/**
 * MCPClient - Implementation of the Model Context Protocol client class
 * 
 * This class implements the MCP specification for adding context to AI models:
 * - Handles communication with MCP servers
 * - Manages authentication
 * - Formats requests according to the protocol
 * - Processes context responses
 */

import axios from 'axios';
import { MCP_ERROR_CODES, MCPError } from './mcpError.js';
import { createJsonRpcRequest, createJsonRpcNotification } from './jsonRpc.js';
import { parseMCPError } from './mcpErrors.js';

/**
 * MCP Client class for interacting with MCP servers
 */
export class MCPClient {
  /**
   * Create a new MCP client instance
   * @param {Object} config - Configuration object
   * @param {string} config.url - MCP server URL
   * @param {string} config.authType - Authentication type ('none', 'apiKey', 'bearer', 'basic')
   * @param {Object} config.authConfig - Authentication configuration
   */
  constructor(config) {
    this.url = config.url;
    this.authType = config.authType || 'none';
    this.authConfig = config.authConfig || {};
    this.name = config.name || 'MCP Server';
    this.enabled = config.enabled !== undefined ? config.enabled : true;
    this.id = config.id; // Store the ID for reference
    this.serverCapabilities = null; // Will be populated during initialization
    this.initialized = false; // Track initialization status
    
    // Create axios instance with base URL
    this.client = axios.create({
      baseURL: this.url,
      timeout: 10000, // 10 second timeout
      headers: this._buildHeaders()
    });
  }

  /**
   * Build request headers based on authentication configuration
   * @returns {Object} Headers object for requests
   * @private
   */
  _buildHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    switch (this.authType) {
      case 'apiKey':
        headers[this.authConfig.headerName || 'Authorization'] = this.authConfig.apiKey;
        break;
      case 'bearer':
        headers['Authorization'] = `Bearer ${this.authConfig.token}`;
        break;
      case 'basic':
        const credentials = btoa(`${this.authConfig.username}:${this.authConfig.password}`);
        headers['Authorization'] = `Basic ${credentials}`;
        break;
    }

    return headers;
  }

  /**
   * Send a JSON-RPC request to the server
   * @param {string} method - Method name
   * @param {Object} params - Request parameters
   * @returns {Promise<Object>} Response data
   * @private
   */
  async _sendJsonRpcRequest(method, params = {}) {
    try {
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
    } catch (error) {
      if (error instanceof MCPError) {
        throw error;
      }
      
      console.error(`MCP request failed (${method}):`, error);
      throw parseMCPError(error, method);
    }
  }

  /**
   * Send a JSON-RPC notification to the server (no response expected)
   * @param {string} method - Method name
   * @param {Object} params - Notification parameters
   * @returns {Promise<void>}
   * @private
   */
  async _sendJsonRpcNotification(method, params = {}) {
    try {
      const notification = createJsonRpcNotification(method, params);
      await this.client.post('/', notification);
    } catch (error) {
      console.error(`MCP notification failed (${method}):`, error);
      throw parseMCPError(error, method);
    }
  }

  /**
   * Initialize the client connection with the server
   * @returns {Promise<boolean>} Whether initialization succeeded
   */
  async initialize() {
    if (this.initialized) {
      console.log(`MCP client ${this.name} already initialized`);
      return true;
    }

    try {
      console.log(`Initializing MCP client for ${this.name}...`);
      
      // Step 1: Send initialize request with client capabilities
      const initializeParams = {
        clientInfo: {
          name: "OpenAI Chat App MCP Client",
          version: "1.0.0"
        },
        capabilities: {
          resources: true,
          prompts: false, // Not supporting prompts feature yet
          tools: false    // Not supporting tools feature yet
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
          this.serverCapabilities = capabilities;
          this.initialized = true;
          console.log(`MCP client ${this.name} initialized with legacy capabilities:`, this.serverCapabilities);
          return true;
        } catch (legacyError) {
          console.error(`Legacy initialization failed for ${this.name}:`, legacyError);
          return false;
        }
      }
    } catch (error) {
      console.error(`Failed to initialize MCP client ${this.name}:`, error);
      return false;
    }
  }

  /**
   * Ensure the client is initialized before proceeding
   * @returns {Promise<boolean>} Whether initialization succeeded
   * @private
   */
  async _ensureInitialized() {
    if (!this.initialized) {
      return await this.initialize();
    }
    return true;
  }

  /**
   * Get context for a message from the MCP server
   * @param {Object} options - Request options
   * @param {Array} options.messages - Array of messages in the conversation
   * @param {Object} options.parameters - Additional parameters for the request
   * @returns {Promise<Object>} Context response
   */
  async getContext(options = {}) {
    try {
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
    } catch (error) {
      console.error(`MCP context request failed to ${this.name}:`, error);
      if (error instanceof MCPError) {
        throw error;
      }
      throw new MCPError(
        MCP_ERROR_CODES.ContextUnavailable,
        `MCP context request failed: ${error.message}`
      );
    }
  }

  /**
   * Check the health/status of the MCP server
   * @returns {Promise<Object>} Health check response
   */
  async checkHealth() {
    try {
      // Note: The health endpoint is not part of the core MCP spec,
      // but we'll keep it and implement in both ways for compatibility
      
      try {
        // First try the JSON-RPC method
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
    } catch (error) {
      console.error(`MCP health check failed for ${this.name}:`, error);
      return {
        status: 'unhealthy',
        error: error instanceof MCPError ? 
               `${error.code}: ${error.message}` : 
               error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get capabilities of the MCP server
   * @returns {Promise<Object>} Capabilities response
   */
  async getCapabilities() {
    try {
      // Try JSON-RPC format first
      try {
        return await this._sendJsonRpcRequest('getCapabilities', {});
      } catch (jsonRpcError) {
        // Fall back to REST API style
        const response = await this.client.get('/capabilities');
        return response.data;
      }
    } catch (error) {
      console.error(`Failed to get MCP capabilities from ${this.name}:`, error);
      if (error instanceof MCPError) {
        throw error;
      }
      throw new MCPError(
        MCP_ERROR_CODES.InternalError,
        `Failed to get MCP capabilities: ${error.message}`
      );
    }
  }
}