/**
 * ContextServiceModule - Handles context-related operations with MCP servers
 * 
 * This module contains functionality for:
 * - Retrieving context from MCP servers
 * - Retrieving prompt suggestions from MCP servers
 */

import { MCPError } from '../mcpErrors';

export class ContextServiceModule {
  /**
   * Create a new ContextServiceModule
   * @param {ClientOperationsModule} clientOps - Reference to the client operations module
   */
  constructor(clientOps) {
    this.clientOps = clientOps;
  }

  /**
   * Get context from all enabled MCP servers
   * @param {Object} options - Request options
   * @returns {Promise<Array<Object>>} Array of context responses
   */
  async getContextFromAll(options) {
    // Filter for enabled clients
    const enabledClients = this.clientOps.getAllClients().filter(client => client.enabled);
    
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
    const enabledClients = this.clientOps.getAllClients().filter(
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
}