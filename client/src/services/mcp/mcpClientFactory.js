/**
 * MCP Client Factory - Creates appropriate MCP client instances
 * 
 * This factory module helps with:
 * - Selecting the right client implementation based on config
 * - Providing dependency injection for testing
 * - Supporting protocol auto-detection
 */

import { MCPJsonRpcClient } from './MCPJsonRpcClient.js';
import { MCPRestClient } from './MCPRestClient.js';

/**
 * Client protocol types
 */
export const ClientProtocol = {
  JSON_RPC: 'json-rpc',
  REST: 'rest',
  AUTO: 'auto', // Auto-detect based on server capabilities
};

/**
 * Create an MCP client based on configuration
 * @param {Object} config - Client configuration
 * @param {string} [protocol=ClientProtocol.AUTO] - Protocol to use
 * @returns {MCPClientBase} Client instance
 */
export function createMCPClient(config, protocol = ClientProtocol.AUTO) {
  if (protocol === ClientProtocol.REST) {
    return new MCPRestClient(config);
  }
  
  // Default to JSON-RPC for AUTO and explicit JSON-RPC since we can
  // fall back to REST within the JSON-RPC client if needed
  return new MCPJsonRpcClient(config);
}