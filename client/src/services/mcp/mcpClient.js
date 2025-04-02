/**
 * MCP Client - Implementation of the Model Context Protocol client
 * 
 * This module serves as the main entry point for MCP functionality:
 * - Exports all MCP-related classes and utilities
 * - Provides a singleton instance of the MCPClientManager
 */

// Import from separate modules
import { MCPClientBase } from './MCPClientBase';
import { MCPJsonRpcClient } from './MCPJsonRpcClient';
import { MCPRestClient } from './MCPRestClient';
import { MCPClientManager } from './MCPClientManager';
import { MCP_ERROR_CODES, MCPError } from './mcpErrors';
import { createJsonRpcRequest, createJsonRpcNotification } from './jsonRpc';
import { createMCPClient, ClientProtocol } from './mcpClientFactory';

// Re-export all MCP-related classes and utilities
export {
  MCPClientBase,
  MCPJsonRpcClient,
  MCPRestClient,
  MCPClientManager,
  MCP_ERROR_CODES,
  MCPError,
  createJsonRpcRequest,
  createJsonRpcNotification,
  createMCPClient,
  ClientProtocol
};

// Create singleton instance
const mcpClientManager = new MCPClientManager();
export default mcpClientManager;
