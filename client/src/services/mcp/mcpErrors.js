/**
 * MCP Errors - Error definitions and handling for the Model Context Protocol client
 */

/**
 * MCP-specific error codes based on JSON-RPC 2.0 and MCP specification
 */
export const MCP_ERROR_CODES = {
  // Standard JSON-RPC error codes
  ParseError: -32700,           // Invalid JSON was received
  InvalidRequest: -32600,       // The JSON sent is not a valid Request object
  MethodNotFound: -32601,       // The method does not exist / is not available
  InvalidParams: -32602,        // Invalid method parameter(s)
  InternalError: -32603,        // Internal JSON-RPC error
  
  // MCP-specific error codes (reserved range -32000 to -32099)
  ServerNotInitialized: -32002, // Server not initialized
  ResourceNotFound: -32003,     // Requested resource not found
  AuthenticationFailed: -32010, // Authentication failure
  AuthorizationFailed: -32011,  // Authorization failure
  RateLimitExceeded: -32020,    // Rate limit exceeded
  ContextUnavailable: -32030,   // Context not available
  InvalidContent: -32040,       // Invalid content in request
};

/**
 * MCP error with code and message
 */
export class MCPError extends Error {
  constructor(code, message, details = null) {
    super(message);
    this.name = 'MCPError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Parse error from response and convert to appropriate MCPError
 * @param {Error} error - Original error
 * @param {string} method - Method that was called
 * @returns {MCPError} Properly formatted MCP error
 */
export function parseMCPError(error, method) {
  // Check if it's a JSON-RPC error with code
  if (error.response?.data?.error?.code) {
    const { code, message, data } = error.response.data.error;
    return new MCPError(code, message || `Error in ${method}`, data);
  }
  
  // Map HTTP errors to appropriate MCP error codes
  if (error.response) {
    switch (error.response.status) {
      case 400:
        return new MCPError(
          MCP_ERROR_CODES.InvalidRequest,
          `Invalid request to ${method}: ${error.message}`
        );
      case 401:
        return new MCPError(
          MCP_ERROR_CODES.AuthenticationFailed,
          `Authentication failed: ${error.message}`
        );
      case 403:
        return new MCPError(
          MCP_ERROR_CODES.AuthorizationFailed,
          `Authorization failed: ${error.message}`
        );
      case 404:
        return new MCPError(
          MCP_ERROR_CODES.ResourceNotFound,
          `Resource not found: ${error.message}`
        );
      case 429:
        return new MCPError(
          MCP_ERROR_CODES.RateLimitExceeded,
          `Rate limit exceeded: ${error.message}`
        );
      case 500:
      case 502:
      case 503:
      case 504:
        return new MCPError(
          MCP_ERROR_CODES.InternalError,
          `Server error during ${method}: ${error.message}`
        );
      default:
        return new MCPError(
          MCP_ERROR_CODES.InternalError,
          `Error in ${method}: ${error.message}`
        );
    }
  }
  
  // Network or other errors
  return new MCPError(
    MCP_ERROR_CODES.InternalError,
    `Error in ${method}: ${error.message}`
  );
}