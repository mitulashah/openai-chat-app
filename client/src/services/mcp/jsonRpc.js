/**
 * JSON-RPC utilities for MCP client
 * 
 * Helper functions for creating JSON-RPC 2.0 requests and notifications
 */

/**
 * Generate a unique request ID for JSON-RPC
 * @returns {string} Unique ID
 */
export function generateRequestId() {
  return `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
}

/**
 * Create a JSON-RPC 2.0 request object
 * @param {string} method - Method name
 * @param {Object} params - Request parameters
 * @returns {Object} JSON-RPC request object
 */
export function createJsonRpcRequest(method, params = {}) {
  return {
    jsonrpc: '2.0',
    id: generateRequestId(),
    method,
    params
  };
}

/**
 * Create a JSON-RPC 2.0 notification object (no response expected)
 * @param {string} method - Method name
 * @param {Object} params - Notification parameters
 * @returns {Object} JSON-RPC notification object
 */
export function createJsonRpcNotification(method, params = {}) {
  return {
    jsonrpc: '2.0',
    method,
    params
  };
}