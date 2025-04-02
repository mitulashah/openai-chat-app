import React, { createContext, useContext, useMemo } from 'react';
import { useMCPClient } from '../hooks/useMCPClient';

// Create context
export const MCPContext = createContext({});

// Custom hook to use the MCP context
export const useMCP = () => useContext(MCPContext);

/**
 * MCP Context Provider component
 * 
 * Provides MCP client functionality to components
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactElement} Context provider
 */
export const MCPProvider = ({ children }) => {
  const mcpState = useMCPClient();

  // Memoize the context value to prevent unnecessary renders
  const value = useMemo(() => ({
    // Server management
    servers: mcpState.servers || [],
    addServer: mcpState.addServer || (() => console.warn('addServer not implemented')),
    toggleServer: mcpState.toggleServer || (() => console.warn('toggleServer not implemented')),
    removeServer: mcpState.removeServer || (() => console.warn('removeServer not implemented')),
    updateServer: mcpState.updateServer || (() => console.warn('updateServer not implemented')),
    
    // MCP operations
    getContext: mcpState.getContextForConversation || (() => Promise.resolve([])),
    checkHealth: mcpState.checkMCPHealth || (() => Promise.resolve([])),
    getCapabilities: mcpState.getCapabilities || (() => Promise.resolve([])),
    getServersByCapability: mcpState.getServersByCapability || (() => []),
    initializeAllClients: mcpState.initializeAllClients || (() => Promise.resolve([])),
    
    // New prompts capability
    getPrompts: mcpState.getPromptsForConversation || (() => Promise.resolve([])),
    
    // New tools capabilities
    getTools: mcpState.getAvailableTools || (() => Promise.resolve([])),
    executeTool: mcpState.executeServerTool || (() => Promise.resolve({ success: false, error: 'Not implemented' })),
    
    // Status flags
    isInitialized: mcpState.clientsInitialized || false,
    isProcessing: mcpState.isProcessing || false
  }), [mcpState]);

  return (
    <MCPContext.Provider value={value}>
      {children}
    </MCPContext.Provider>
  );
};