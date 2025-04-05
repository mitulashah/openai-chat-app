/**
 * ServerInfoModule - Handles server information operations
 * 
 * This module contains functionality for:
 * - Checking health status of MCP servers
 * - Getting capabilities of MCP servers
 */

import { MCPError } from '../mcpErrors.js';

export class ServerInfoModule {
  /**
   * Create a new ServerInfoModule
   * @param {ClientOperationsModule} clientOps - Reference to the client operations module
   */
  constructor(clientOps) {
    this.clientOps = clientOps;
  }

  /**
   * Check health of all MCP servers
   * @returns {Promise<Array<Object>>} Health status for all servers
   */
  async checkHealthAll() {
    const healthPromises = this.clientOps.getAllClients().map(async client => {
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
    const capabilitiesPromises = this.clientOps.getAllClients().map(async client => {
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