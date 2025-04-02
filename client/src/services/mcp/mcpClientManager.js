/**
 * MCPClientManager - Manager for MCP client instances
 * 
 * This class manages multiple MCP client instances:
 * - Creates and stores MCP clients using a factory
 * - Handles initialization of all clients
 * - Coordinates context requests across multiple servers
 * - Provides consistent error handling and response formatting
 */

import { MCPError } from './mcpErrors';
import { createMCPClient, ClientProtocol } from './mcpClientFactory';

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
      this._backgroundInitialize(client);
      
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
   * Initialize a client in the background
   * @param {Object} client - Client to initialize
   * @private
   */
  _backgroundInitialize(client) {
    setTimeout(async () => {
      try {
        const result = await client.initialize();
        if (!result?.success) {
          console.warn(`Background initialization of MCP client ${client.name} failed:`, 
            result?.error || "Unknown error");
        }
      } catch (err) {
        console.warn(`Background initialization of MCP client ${client.name} failed with exception:`, 
          err);
      }
    }, 0);
  }

  /**
   * Get an MCP client by ID
   * @param {string} id - Client identifier
   * @returns {Object|null} The client or null if not found
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
   * @returns {Array<Object>} Array of clients
   */
  getAllClients() {
    return Array.from(this.clients.values());
  }

  /**
   * Get all initialized clients
   * @returns {Array<Object>} Array of initialized clients
   */
  getInitializedClients() {
    return this.getAllClients().filter(client => client.initialized);
  }

  /**
   * Get clients that support a specific capability
   * @param {string} capability - Capability name
   * @returns {Array<Object>} Array of clients with the capability
   */
  getClientsByCapability(capability) {
    return this.getInitializedClients().filter(client => {
      // Check if server has this capability
      return client.serverCapabilities && 
             client.serverCapabilities[capability];
    });
  }

  /**
   * Initialize all clients
   * @returns {Promise<Array<Object>>} Results of initialization
   */
  async initializeAllClients() {
    const initPromises = this.getAllClients().map(async client => {
      try {
        const result = await client.initialize();
        return { 
          id: client.id,
          name: client.name,
          ...(result || { success: false, error: "No result returned from client" })
        };
      } catch (error) {
        console.error(`Failed to initialize client ${client.name}:`, error);
        return { 
          id: client.id,
          name: client.name,
          success: false, 
          error: error.message || "Unknown error" 
        };
      }
    });
    
    return await Promise.all(initPromises);
  }

  /**
   * Get context from all enabled MCP servers
   * @param {Object} options - Request options
   * @returns {Promise<Array<Object>>} Array of context responses
   */
  async getContextFromAll(options) {
    // Filter for enabled clients
    const enabledClients = this.getAllClients().filter(client => client.enabled);
    
    try {
      const contextPromises = enabledClients.map(async client => {
        try {
          const result = await client.getContext(options);
          return {
            id: client.id, 
            source: client.name, 
            url: client.url,
            ...(result || { success: false, error: "No result returned from client" })
          };
        } catch (error) {
          return { 
            id: client.id,
            source: client.name, 
            url: client.url,
            success: false,
            error: error instanceof MCPError ? 
                  `${error.code}: ${error.message}` : 
                  error.message || "Unknown error"
          };
        }
      });
      
      return await Promise.all(contextPromises);
    } catch (error) {
      console.error('Error fetching context from MCP servers:', error);
      return [];
    }
  }

  /**
   * Get prompt suggestions from all enabled MCP servers with prompts capability
   * @param {Object} options - Request options
   * @returns {Promise<Array<Object>>} Array of prompts responses
   */
  async getPromptsFromAll(options) {
    // Filter for enabled clients with prompts capability
    const enabledClients = this.getAllClients().filter(
      client => client.enabled && client.serverCapabilities?.prompts
    );
    
    if (enabledClients.length === 0) {
      return [];
    }
    
    try {
      const promptsPromises = enabledClients.map(async client => {
        try {
          const result = await client.getPrompts(options);
          return {
            id: client.id, 
            source: client.name, 
            url: client.url,
            ...(result || { success: false, error: "No result returned from client" })
          };
        } catch (error) {
          return { 
            id: client.id,
            source: client.name, 
            url: client.url,
            success: false,
            error: error instanceof MCPError ? 
                  `${error.code}: ${error.message}` : 
                  error.message || "Unknown error"
          };
        }
      });
      
      return await Promise.all(promptsPromises);
    } catch (error) {
      console.error('Error fetching prompts from MCP servers:', error);
      return [];
    }
  }

  /**
   * Get available tools from all enabled MCP servers with tools capability
   * @param {Object} options - Request options
   * @returns {Promise<Array<Object>>} Array of tools responses
   */
  async getToolsFromAll(options) {
    // Filter for enabled clients with tools capability
    const enabledClients = this.getAllClients().filter(
      client => client.enabled && client.serverCapabilities?.tools
    );
    
    if (enabledClients.length === 0) {
      return [];
    }
    
    try {
      const toolsPromises = enabledClients.map(async client => {
        try {
          const result = await client.getTools(options);
          return {
            id: client.id, 
            source: client.name, 
            url: client.url,
            ...(result || { success: false, error: "No result returned from client" })
          };
        } catch (error) {
          return { 
            id: client.id,
            source: client.name, 
            url: client.url,
            success: false,
            error: error instanceof MCPError ? 
                  `${error.code}: ${error.message}` : 
                  error.message || "Unknown error"
          };
        }
      });
      
      return await Promise.all(toolsPromises);
    } catch (error) {
      console.error('Error fetching tools from MCP servers:', error);
      return [];
    }
  }

  /**
   * Execute a tool on a specific MCP server
   * @param {string} serverId - ID of the MCP server to execute the tool on
   * @param {Object} options - Tool execution options
   * @returns {Promise<Object>} Tool execution result
   */
  async executeTool(serverId, options) {
    const client = this.getClient(serverId);
    
    if (!client) {
      throw new MCPError(
        MCP_ERROR_CODES.ResourceNotFound,
        `MCP server with ID ${serverId} not found`
      );
    }
    
    if (!client.enabled) {
      throw new MCPError(
        MCP_ERROR_CODES.ServerNotInitialized,
        `MCP server ${client.name} is disabled`
      );
    }
    
    if (!client.serverCapabilities?.tools) {
      throw new MCPError(
        MCP_ERROR_CODES.MethodNotFound,
        `MCP server ${client.name} does not support tools capability`
      );
    }
    
    try {
      const result = await client.executeTool(options);
      return {
        id: client.id,
        source: client.name,
        url: client.url,
        ...(result || { success: false, error: "No result returned from client" })
      };
    } catch (error) {
      return {
        id: client.id,
        source: client.name,
        url: client.url,
        success: false,
        error: error instanceof MCPError ? 
              `${error.code}: ${error.message}` : 
              error.message || "Unknown error"
      };
    }
  }

  /**
   * Check health of all MCP servers
   * @returns {Promise<Array<Object>>} Health status for all servers
   */
  async checkHealthAll() {
    const healthPromises = this.getAllClients().map(async client => {
      try {
        const result = await client.checkHealth();
        return {
          id: client.id,
          name: client.name,
          url: client.url,
          ...(result || { success: false, error: "No result returned from client" })
        };
      } catch (error) {
        return {
          id: client.id,
          name: client.name,
          url: client.url,
          success: false,
          status: 'unhealthy',
          error: error.message || "Unknown error"
        };
      }
    });
    
    return await Promise.all(healthPromises);
  }

  /**
   * Get capabilities of all MCP servers
   * @returns {Promise<Array<Object>>} Capabilities from all servers
   */
  async getCapabilitiesAll() {
    const capabilitiesPromises = this.getAllClients().map(async client => {
      try {
        const result = await client.getCapabilities();
        return {
          id: client.id,
          name: client.name,
          url: client.url,
          ...(result || { success: false, error: "No result returned from client" })
        };
      } catch (error) {
        return {
          id: client.id,
          name: client.name,
          url: client.url,
          success: false,
          error: error instanceof MCPError ? 
                `${error.code}: ${error.message}` : 
                error.message || "Unknown error"
        };
      }
    });
    
    return await Promise.all(capabilitiesPromises);
  }
}