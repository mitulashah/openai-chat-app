/**
 * MCP Client - Implementation of the Model Context Protocol client
 * 
 * This client implements the MCP specification for adding context to AI models:
 * - Handles communication with MCP servers
 * - Manages authentication
 * - Formats requests according to the protocol
 * - Processes context responses
 */

import axios from 'axios';

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
   * Get context for a message from the MCP server
   * @param {Object} options - Request options
   * @param {Array} options.messages - Array of messages in the conversation
   * @param {Object} options.parameters - Additional parameters for the request
   * @returns {Promise<Object>} Context response
   */
  async getContext(options = {}) {
    try {
      const { messages = [], parameters = {} } = options;
      
      const payload = {
        messages,
        parameters
      };
      
      const response = await this.client.post('/context', payload);
      return response.data;
    } catch (error) {
      console.error(`MCP context request failed to ${this.name}:`, error);
      throw new Error(`MCP context request failed: ${error.message}`);
    }
  }

  /**
   * Check the health/status of the MCP server
   * @returns {Promise<Object>} Health check response
   */
  async checkHealth() {
    try {
      const response = await this.client.get('/health');
      return {
        status: 'healthy',
        details: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`MCP health check failed for ${this.name}:`, error);
      return {
        status: 'unhealthy',
        error: error.message,
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
      const response = await this.client.get('/capabilities');
      return response.data;
    } catch (error) {
      console.error(`Failed to get MCP capabilities from ${this.name}:`, error);
      throw new Error(`Failed to get MCP capabilities: ${error.message}`);
    }
  }
}

/**
 * MCP Client Manager - Manages multiple MCP client instances
 */
export class MCPClientManager {
  constructor() {
    this.clients = new Map();
  }

  /**
   * Add or update an MCP client
   * @param {string} id - Unique identifier for the client
   * @param {Object} config - Client configuration
   * @returns {MCPClient} The created/updated client
   */
  setClient(id, config) {
    const client = new MCPClient(config);
    this.clients.set(id, client);
    return client;
  }

  /**
   * Get an MCP client by ID
   * @param {string} id - Client identifier
   * @returns {MCPClient|null} The client or null if not found
   */
  getClient(id) {
    return this.clients.get(id) || null;
  }

  /**
   * Remove an MCP client
   * @param {string} id - Client identifier
   * @returns {boolean} True if the client was removed
   */
  removeClient(id) {
    return this.clients.delete(id);
  }

  /**
   * Get all available MCP clients
   * @returns {Array<MCPClient>} Array of clients
   */
  getAllClients() {
    return Array.from(this.clients.values());
  }

  /**
   * Get context from all enabled MCP servers
   * @param {Object} options - Request options
   * @returns {Promise<Array<Object>>} Array of context responses
   */
  async getContextFromAll(options) {
    const enabledClients = this.getAllClients().filter(client => client.enabled);
    
    try {
      const contextPromises = enabledClients.map(client => 
        client.getContext(options)
          .then(result => ({ 
            success: true, 
            source: client.name, 
            url: client.url,
            data: result 
          }))
          .catch(error => ({ 
            success: false, 
            source: client.name, 
            url: client.url,
            error: error.message 
          }))
      );
      
      return await Promise.all(contextPromises);
    } catch (error) {
      console.error('Error fetching context from MCP servers:', error);
      return [];
    }
  }

  /**
   * Check health of all MCP servers
   * @returns {Promise<Object>} Health status for all servers
   */
  async checkHealthAll() {
    const healthPromises = this.getAllClients().map(async client => {
      const health = await client.checkHealth();
      return {
        id: client.id,
        name: client.name,
        url: client.url,
        ...health
      };
    });
    
    return await Promise.all(healthPromises);
  }
}

// Create singleton instance
const mcpClientManager = new MCPClientManager();
export default mcpClientManager;