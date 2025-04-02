import { useEffect, useCallback, useState } from 'react';
import { useMCPServers } from './useMCPServers';
import mcpClientManager, { MCPError, ClientProtocol } from '../services/mcp/mcpClient';

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
    updateServer
  } = useMCPServers();
  
  const [clientsInitialized, setClientsInitialized] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  /**
   * Helper function to safely extract server ID from a result
   * @param {Object} result - Result object from MCP client operation 
   * @returns {number|null} - Extracted server ID or null
   * @private
   */
  const _extractServerId = useCallback((result) => {
    if (!result || !result.id) return null;
    
    try {
      return parseInt(result.id);
    } catch (e) {
      return null;
    }
  }, []);

  // Sync MCP client manager with server configurations
  useEffect(() => {
    // Clear existing clients first
    mcpClientManager.getAllClients().forEach(client => {
      const id = client.id;
      if (id) {
        mcpClientManager.removeClient(id);
      }
    });

    // Add all configured servers
    servers.forEach(server => {
      // Determine protocol based on server settings (could be extended in future)
      const protocol = server.protocol || ClientProtocol.AUTO;
      
      mcpClientManager.setClient(server.id.toString(), {
        name: server.name,
        url: server.url,
        enabled: server.enabled,
        authType: server.authType,
        authConfig: server.authConfig
      }, protocol);
    });
    
    // Initialize all clients in the background
    initializeAllClients().catch(err => {
      console.warn('Background initialization of MCP clients failed:', err);
    });
  }, [servers]);

  /**
   * Initialize all MCP clients
   * @returns {Promise<Array>} Results of initialization
   */
  const initializeAllClients = useCallback(async () => {
    setIsProcessing(true);
    
    try {
      const results = await mcpClientManager.initializeAllClients();
      
      // Update server health statuses in the UI based on initialization results
      results.forEach(result => {
        const serverId = _extractServerId(result);
        if (serverId) {
          updateServer(serverId, { 
            initialized: result.success,
            health: result.success ? 'healthy' : 'unhealthy',
            error: result.success ? null : result.error?.message || 'Initialization failed'
          });
        }
      });
      
      setClientsInitialized(true);
      return results;
    } catch (error) {
      console.error('Error initializing MCP clients:', error);
      setClientsInitialized(false);
      return [];
    } finally {
      setIsProcessing(false);
    }
  }, [updateServer, _extractServerId]);

  /**
   * Get context from MCP servers for the current conversation
   * @param {Array} messages - Array of messages in the conversation
   * @returns {Promise<Array>} Context responses from MCP servers
   */
  const getContextForConversation = useCallback(async (messages) => {
    setIsProcessing(true);
    
    // Format messages for MCP protocol
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp || new Date().toISOString(),
      messageId: msg.id || `msg-${Date.now()}`
    }));

    try {
      const results = await mcpClientManager.getContextFromAll({
        resource: { uri: "chat://conversation" },
        messages: formattedMessages,
        parameters: {
          maxResults: 5,
          minRelevanceScore: 0.7,
          includeMetadata: true
        }
      });
      
      // Process successful results
      const contextResults = results.filter(r => r.success && r.data);
      
      if (contextResults.length > 0) {
        console.log(`Retrieved context from ${contextResults.length} of ${results.length} MCP servers`);
      }
      
      // Update server statuses based on results
      results.forEach(result => {
        const serverId = _extractServerId(result);
        if (serverId) {
          updateServer(serverId, {
            lastResponse: new Date().toISOString(),
            lastResponseSuccess: result.success,
            error: result.success ? null : result.error?.message || 'Failed to get context'
          });
        }
      });
      
      return results;
    } catch (error) {
      console.error('Error getting context from MCP servers:', error);
      return [];
    } finally {
      setIsProcessing(false);
    }
  }, [updateServer, _extractServerId]);

  /**
   * Check health of all configured MCP servers
   * @returns {Promise<Array>} Health status for all servers
   */
  const checkHealth = useCallback(async () => {
    setIsProcessing(true);
    
    try {
      const results = await mcpClientManager.checkHealthAll();
      
      // Update server health statuses in the UI
      results.forEach(result => {
        const serverId = _extractServerId(result);
        if (serverId) {
          updateServer(serverId, { 
            health: result.success ? result.data?.status || 'healthy' : 'unhealthy',
            lastChecked: new Date().toISOString(),
            error: result.success ? null : result.error?.message || 'Health check failed'
          });
        }
      });
      
      return results;
    } catch (error) {
      console.error('Error checking MCP servers health:', error);
      return [];
    } finally {
      setIsProcessing(false);
    }
  }, [updateServer, _extractServerId]);
  
  /**
   * Get server capabilities from all clients
   * @returns {Promise<Array>} Capabilities from servers
   */
  const getCapabilities = useCallback(async () => {
    setIsProcessing(true);
    
    try {
      const results = await mcpClientManager.getCapabilitiesAll();
      
      // Update server capabilities in the UI
      results.forEach(result => {
        const serverId = _extractServerId(result);
        if (serverId) {
          if (result.success) {
            updateServer(serverId, { 
              capabilities: result.data,
              lastChecked: new Date().toISOString(),
              error: null
            });
          } else {
            updateServer(serverId, { 
              lastChecked: new Date().toISOString(),
              error: result.error?.message || 'Failed to get capabilities'
            });
          }
        }
      });
      
      return results;
    } catch (error) {
      console.error('Error getting capabilities from MCP servers:', error);
      return [];
    } finally {
      setIsProcessing(false);
    }
  }, [updateServer, _extractServerId]);

  /**
   * Get prompt suggestions from MCP servers for the current conversation
   * @param {Array} messages - Array of messages in the conversation
   * @returns {Promise<Array>} Prompts responses from MCP servers
   */
  const getPromptsForConversation = useCallback(async (messages) => {
    setIsProcessing(true);
    
    // Format messages for MCP protocol
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp || new Date().toISOString(),
      messageId: msg.id || `msg-${Date.now()}`
    }));

    try {
      const results = await mcpClientManager.getPromptsFromAll({
        messages: formattedMessages,
        parameters: {
          maxResults: 5,
          minRelevanceScore: 0.7
        }
      });
      
      // Process successful results
      const promptResults = results.filter(r => r.success && r.data);
      
      if (promptResults.length > 0) {
        console.log(`Retrieved prompts from ${promptResults.length} of ${results.length} MCP servers`);
      }
      
      // Update server statuses based on results
      results.forEach(result => {
        const serverId = _extractServerId(result);
        if (serverId) {
          updateServer(serverId, {
            lastResponse: new Date().toISOString(),
            lastResponseSuccess: result.success,
            error: result.success ? null : result.error?.message || 'Failed to get prompts'
          });
        }
      });
      
      return results;
    } catch (error) {
      console.error('Error getting prompts from MCP servers:', error);
      return [];
    } finally {
      setIsProcessing(false);
    }
  }, [updateServer, _extractServerId]);

  /**
   * Get available tools from all MCP servers
   * @param {Object} options - Request options
   * @returns {Promise<Array>} Available tools from MCP servers
   */
  const getAvailableTools = useCallback(async (options = {}) => {
    setIsProcessing(true);
    
    try {
      const results = await mcpClientManager.getToolsFromAll(options);
      
      // Process successful results
      const toolResults = results.filter(r => r.success && r.data);
      
      if (toolResults.length > 0) {
        console.log(`Retrieved tools from ${toolResults.length} of ${results.length} MCP servers`);
      }
      
      // Update server statuses based on results
      results.forEach(result => {
        const serverId = _extractServerId(result);
        if (serverId) {
          updateServer(serverId, {
            lastResponse: new Date().toISOString(),
            lastResponseSuccess: result.success,
            error: result.success ? null : result.error?.message || 'Failed to get tools'
          });
        }
      });
      
      return results;
    } catch (error) {
      console.error('Error getting tools from MCP servers:', error);
      return [];
    } finally {
      setIsProcessing(false);
    }
  }, [updateServer, _extractServerId]);

  /**
   * Execute a tool on a specific MCP server
   * @param {string} serverId - ID of the server to execute the tool on
   * @param {Object} toolOptions - Tool execution options
   * @returns {Promise<Object>} Tool execution result
   */
  const executeServerTool = useCallback(async (serverId, toolOptions) => {
    setIsProcessing(true);
    
    try {
      const result = await mcpClientManager.executeTool(serverId, toolOptions);
      
      // Update server status based on result
      const sid = _extractServerId(result);
      if (sid) {
        updateServer(sid, {
          lastResponse: new Date().toISOString(),
          lastResponseSuccess: result.success,
          error: result.success ? null : result.error?.message || 'Failed to execute tool'
        });
      }
      
      return result;
    } catch (error) {
      console.error(`Error executing tool on MCP server ${serverId}:`, error);
      return {
        success: false,
        error: error instanceof MCPError ? 
              `${error.code}: ${error.message}` : 
              error.message || "Unknown error"
      };
    } finally {
      setIsProcessing(false);
    }
  }, [updateServer, _extractServerId]);

  /**
   * Get servers that support a specific capability
   * @param {string} capability - The capability name to check
   * @returns {Array<Object>} List of matching servers
   */
  const getServersByCapability = useCallback((capability) => {
    const clients = mcpClientManager.getClientsByCapability(capability);
    
    // Map clients to server objects with IDs
    return clients.map(client => {
      const server = servers.find(s => s.id.toString() === client.id);
      return server || {
        id: parseInt(client.id),
        name: client.name,
        url: client.url,
        enabled: client.enabled,
        capabilities: client.serverCapabilities
      };
    });
  }, [servers]);

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
    getCapabilities,
    getServersByCapability,
    initializeAllClients,
    
    // New prompt and tool functions
    getPromptsForConversation,
    getAvailableTools,
    executeServerTool,
    
    // Status flags
    clientsInitialized,
    isProcessing
  };
};