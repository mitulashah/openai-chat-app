/**
 * ClientOperationsModule - Handles client lifecycle operations
 * 
 * This module contains functionality for:
 * - Client initialization
 * - Client discovery and retrieval
 * - Client filtering based on capabilities or state
 */

import { MCPError, MCP_ERROR_CODES } from '../mcpErrors.js';

export class ClientOperationsModule {
  /**
   * Create a new ClientOperationsModule
   * @param {Map} clientsMap - Reference to the main client collection
   */
  constructor(clientsMap) {
    this.clients = clientsMap;
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
   * Initialize a client in the background
   * @param {Object} client - Client to initialize
   */
  backgroundInitialize(client) {
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
}