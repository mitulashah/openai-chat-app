/**
 * ToolsServiceModule - Handles tool-related operations with MCP servers
 * 
 * This module contains functionality for:
 * - Retrieving available tools from MCP servers
 * - Executing tools on specific MCP servers
 */

import { MCPError, MCP_ERROR_CODES } from '../mcpErrors';

export class ToolsServiceModule {
  /**
   * Create a new ToolsServiceModule
   * @param {ClientOperationsModule} clientOps - Reference to the client operations module
   */
  constructor(clientOps) {
    this.clientOps = clientOps;
  }

  /**
   * Get available tools from all enabled MCP servers with tools capability
   * @param {Object} options - Request options
   * @returns {Promise<Array<Object>>} Array of tools responses
   */
  async getToolsFromAll(options) {
    // Filter for enabled clients with tools capability
    const enabledClients = this.clientOps.getAllClients().filter(
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
    const client = this.clientOps.getClient(serverId);
    
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
}