import { useState, useCallback } from 'react';

/**
 * Custom hook for managing MCP servers configuration
 * @param {Array} initialServers - Initial server configurations
 * @returns {Object} MCP servers state and management functions
 */
export const useMCPServers = (initialServers = []) => {
  // Start with an empty array instead of adding a default server
  const [servers, setServers] = useState(initialServers);
  
  const [editingServer, setEditingServer] = useState(null);
  
  /**
   * Add a new server to the configuration
   * @param {string} name - Server name
   * @param {string} url - Server URL
   * @param {string} authType - Authentication type (none, apiKey, basic, bearer)
   * @param {Object} authConfig - Authentication configuration
   * @returns {boolean} Success indicator
   */
  const addServer = useCallback((name, url, authType = 'none', authConfig = {}) => {
    if (name && url) {
      setServers(prev => [
        ...prev,
        { 
          id: Date.now(), 
          name, 
          url, 
          enabled: true,
          authType,
          authConfig,
          health: 'unknown'
        }
      ]);
      return true;
    }
    return false;
  }, []);
  
  /**
   * Toggle server enabled/disabled state
   * @param {number} id - Server ID
   */
  const toggleServer = useCallback((id) => {
    setServers(prev => prev.map(server => 
      server.id === id ? { ...server, enabled: !server.enabled } : server
    ));
  }, []);
  
  /**
   * Remove a server from the configuration
   * @param {number} id - Server ID
   */
  const removeServer = useCallback((id) => {
    setServers(prev => prev.filter(server => server.id !== id));
  }, []);
  
  /**
   * Update server configuration
   * @param {number} id - Server ID
   * @param {Object} updates - Properties to update
   */
  const updateServer = useCallback((id, { name, url, authType, authConfig }) => {
    setServers(prev => prev.map(server => 
      server.id === id ? { 
        ...server, 
        name: name || server.name, 
        url: url || server.url,
        authType: authType !== undefined ? authType : server.authType,
        authConfig: authConfig !== undefined ? authConfig : server.authConfig
      } : server
    ));
  }, []);
  
  /**
   * Start editing a server
   * @param {number} id - Server ID
   */
  const startEditing = useCallback((id) => {
    setEditingServer(id);
  }, []);
  
  /**
   * Stop editing servers
   */
  const stopEditing = useCallback(() => {
    setEditingServer(null);
  }, []);
  
  /**
   * Update server health status
   * @param {number} id - Server ID
   * @param {string} health - Health status: 'healthy', 'unhealthy', 'unknown'
   */
  const updateServerHealth = useCallback((id, health) => {
    setServers(prev => prev.map(server => 
      server.id === id ? { ...server, health } : server
    ));
  }, []);
  
  /**
   * Placeholder for future health check implementation
   * Currently just assigns random health statuses for UI testing
   */
  const checkServersHealth = useCallback(() => {
    // This is just a placeholder that randomly sets health status for UI testing
    // Will be replaced with actual implementation in the future
    servers.forEach(server => {
      // For now, randomly set health status just to demonstrate the UI
      const healthOptions = ['healthy', 'unhealthy', 'unknown'];
      const randomHealth = healthOptions[Math.floor(Math.random() * healthOptions.length)];
      updateServerHealth(server.id, randomHealth);
    });
    
    console.log('Health check functionality will be implemented later');
  }, [servers, updateServerHealth]);
  
  return {
    servers,
    editingServer,
    addServer,
    toggleServer,
    removeServer,
    updateServer,
    startEditing,
    stopEditing,
    checkServersHealth
  };
};