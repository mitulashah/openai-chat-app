import { useEffect, useCallback } from 'react';
import { useMCPServers } from './useMCPServers';
import mcpClientManager from '../services/mcp/mcpClient';

/**
 * Hook for using MCP client functionality
 * @returns {Object} MCP client methods and state
 */
export const useMCPClient = () => {
  // Get MCP servers configuration from the existing hook
  const { 
    servers,
    addServer,
    toggleServer,
    removeServer,
    updateServer,
    checkServersHealth
  } = useMCPServers();

  // Sync MCP client manager with server configurations
  useEffect(() => {
    // Clear existing clients first
    mcpClientManager.getAllClients().forEach(client => {
      const id = client.id || client.url;
      mcpClientManager.removeClient(id);
    });

    // Add all configured servers
    servers.forEach(server => {
      mcpClientManager.setClient(server.id.toString(), {
        name: server.name,
        url: server.url,
        enabled: server.enabled,
        authType: server.authType,
        authConfig: server.authConfig
      });
    });
  }, [servers]);

  /**
   * Get context from MCP servers for the current conversation
   * @param {Array} messages - Array of messages in the conversation
   * @returns {Promise<Array>} Context responses from MCP servers
   */
  const getContextForConversation = useCallback(async (messages) => {
    // Format messages for MCP protocol if needed
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      // Add any other required fields for MCP
    }));

    try {
      return await mcpClientManager.getContextFromAll({
        messages: formattedMessages,
        parameters: {
          // Add any additional parameters here
          maxResults: 5,
          minRelevanceScore: 0.7
        }
      });
    } catch (error) {
      console.error('Error getting context from MCP servers:', error);
      return [];
    }
  }, []);

  /**
   * Check health of all configured MCP servers
   * @returns {Promise<Array>} Health status for all servers
   */
  const checkHealth = useCallback(async () => {
    try {
      const healthStatuses = await mcpClientManager.checkHealthAll();
      
      // Update server health statuses in the UI
      healthStatuses.forEach(status => {
        const serverId = parseInt(status.id);
        // This will trigger a UI update through the useMCPServers hook
        updateServer(serverId, { health: status.status });
      });
      
      return healthStatuses;
    } catch (error) {
      console.error('Error checking MCP servers health:', error);
      return [];
    }
  }, [updateServer]);

  return {
    // Re-export server management functions
    servers,
    addServer,
    toggleServer,
    removeServer,
    updateServer,
    
    // MCP client specific functions
    getContextForConversation,
    checkMCPHealth: checkHealth,
  };
};