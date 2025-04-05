/**
 * MCPClientManager - Manager for MCP client instances
 * 
 * This class manages multiple MCP client instances by coordinating between specialized modules:
 * - Creates and stores MCP clients using a factory
 * - Handles initialization of all clients
 * - Coordinates context requests across multiple servers
 * - Provides consistent error handling and response formatting
 */

import { MCPError, MCP_ERROR_CODES } from './mcpErrors';
import { createMCPClient, ClientProtocol } from './mcpClientFactory';
import { ClientOperationsModule } from './modules/ClientOperationsModule';
import { ContextServiceModule } from './modules/ContextServiceModule';
import { ToolsServiceModule } from './modules/ToolsServiceModule';
import { ServerInfoModule } from './modules/ServerInfoModule';

/**
 * MCP Client Manager - Manages multiple MCP client instances
 */
export class MCPClientManager {
  /**
   * Create a new MCP Client Manager
   * @param {Function} clientFactory - Factory function for creating clients (for testing/DI)
   */
  constructor(clientFactory = createMCPClient) {
    this.clients = new Map();
    this.clientFactory = clientFactory;
    
    // Initialize modules
    this.clientOps = new ClientOperationsModule(this.clients);
    this.contextService = new ContextServiceModule(this.clientOps);
    this.toolsService = new ToolsServiceModule(this.clientOps);
    this.serverInfo = new ServerInfoModule(this.clientOps);
  }

  /**
   * Add or update an MCP client
   * @param {string} id - Unique identifier for the client
   * @param {Object} config - Client configuration
   * @param {string} [protocol=ClientProtocol.AUTO] - Protocol to use
   * @returns {Object} The created/updated client
   */
  setClient(id, config, protocol = ClientProtocol.AUTO) {
    try {
      // Make a safe copy of the config
      const safeConfig = { 
        ...(config || {}),
        id
      };
      
      // Create client with the safe config
      const client = this.clientFactory(safeConfig, protocol);
      this.clients.set(id, client);
      
      // Trigger initialization in the background
      this.clientOps.backgroundInitialize(client);
      
      return client;
    } catch (err) {
      console.error(`Failed to set client with ID ${id}:`, err);
      
      // Return a minimal client object to prevent crashes
      return {
        id,
        name: config?.name || 'Error Client',
        initialized: false,
        enabled: false,
        serverCapabilities: null
      };
    }
  }

  /**
   * Get an MCP client by ID
   * @param {string} id - Client identifier
   * @returns {Object|null} The client or null if not found
   */
  getClient(id) {
    return this.clientOps.getClient(id);
  }

  /**
   * Remove an MCP client
   * @param {string} id - Client identifier
   * @returns {boolean} True if the client was removed
   */
  removeClient(id) {
    return this.clientOps.removeClient(id);
  }

  /**
   * Get all available MCP clients
   * @returns {Array<Object>} Array of clients
   */
  getAllClients() {
    return this.clientOps.getAllClients();
  }

  /**
   * Get all initialized clients
   * @returns {Array<Object>} Array of initialized clients
   */
  getInitializedClients() {
    return this.clientOps.getInitializedClients();
  }

  /**
   * Get clients that support a specific capability
   * @param {string} capability - Capability name
   * @returns {Array<Object>} Array of clients with the capability
   */
  getClientsByCapability(capability) {
    return this.clientOps.getClientsByCapability(capability);
  }

  /**
   * Initialize all clients
   * @returns {Promise<Array<Object>>} Results of initialization
   */
  async initializeAllClients() {
    return await this.clientOps.initializeAllClients();
  }

  /**
   * Get context from all enabled MCP servers
   * @param {Object} options - Request options
   * @returns {Promise<Array<Object>>} Array of context responses
   */
  async getContextFromAll(options) {
    return await this.contextService.getContextFromAll(options);
  }

  /**
   * Get prompt suggestions from all enabled MCP servers with prompts capability
   * @param {Object} options - Request options
   * @returns {Promise<Array<Object>>} Array of prompts responses
   */
  async getPromptsFromAll(options) {
    return await this.contextService.getPromptsFromAll(options);
  }

  /**
   * Get available tools from all enabled MCP servers with tools capability
   * @param {Object} options - Request options
   * @returns {Promise<Array<Object>>} Array of tools responses
   */
  async getToolsFromAll(options) {
    return await this.toolsService.getToolsFromAll(options);
  }

  /**
   * Execute a tool on a specific MCP server
   * @param {string} serverId - ID of the MCP server to execute the tool on
   * @param {Object} options - Tool execution options
   * @returns {Promise<Object>} Tool execution result
   */
  async executeTool(serverId, options) {
    return await this.toolsService.executeTool(serverId, options);
  }

  /**
   * Check health of all MCP servers
   * @returns {Promise<Array<Object>>} Health status for all servers
   */
  async checkHealthAll() {
    return await this.serverInfo.checkHealthAll();
  }

  /**
   * Get capabilities of all MCP servers
   * @returns {Promise<Array<Object>>} Capabilities from all servers
   */
  async getCapabilitiesAll() {
    return await this.serverInfo.getCapabilitiesAll();
  }
}