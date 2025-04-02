/**
 * MCPClientBase - Abstract base class for MCP client implementations
 * 
 * This class centralizes common functionality for MCP clients:
 * - Error handling and formatting
 * - Request wrapping
 * - Response standardization
 */

import axios from 'axios';
import { MCP_ERROR_CODES, MCPError } from './mcpErrors';

/**
 * Abstract base class for MCP clients
 */
export class MCPClientBase {
  /**
   * Create a new MCP client instance
   * @param {Object} config - Configuration object
   * @param {string} config.url - MCP server URL
   * @param {string} config.authType - Authentication type ('none', 'apiKey', 'bearer', 'basic')
   * @param {Object} config.authConfig - Authentication configuration
   */
  constructor(config) {
    this.url = config.url;
    this.authType = config.authType || 'none';
    this.authConfig = config.authConfig || {};
    this.name = config.name || 'MCP Server';
    this.enabled = config.enabled !== undefined ? config.enabled : true;
    this.id = config.id; // Store the ID for reference
    this.serverCapabilities = null; // Will be populated during initialization
    this.initialized = false; // Track initialization status
    
    // Create axios instance with base URL
    this.client = axios.create({
      baseURL: this.url,
      timeout: 10000, // 10 second timeout
      headers: this._buildHeaders()
    });
  }

  /**
   * Build request headers based on authentication configuration
   * @returns {Object} Headers object for requests
   * @protected
   */
  _buildHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    switch (this.authType) {
      case 'apiKey':
        headers[this.authConfig.headerName || 'Authorization'] = this.authConfig.apiKey;
        break;
      case 'bearer':
        headers['Authorization'] = `Bearer ${this.authConfig.token}`;
        break;
      case 'basic':
        const credentials = btoa(`${this.authConfig.username}:${this.authConfig.password}`);
        headers['Authorization'] = `Basic ${credentials}`;
        break;
    }

    return headers;
  }

  /**
   * Handle a request with standardized error handling and response formatting
   * @param {string} operation - Name of the operation being performed
   * @param {Function} requestFn - Async function that performs the actual request
   * @returns {Promise<Object>} Standardized response object { success, data|error }
   * @protected
   */
  async _handleRequest(operation, requestFn) {
    try {
      const data = await requestFn();
      return {
        success: true,
        data
      };
    } catch (error) {
      console.error(`MCP ${operation} failed for ${this.name}:`, error);
      return {
        success: false,
        error: this._formatError(error, operation)
      };
    }
  }

  /**
   * Format an error into a standardized structure
   * @param {Error} error - The error to format
   * @param {string} operation - The operation that caused the error
   * @returns {Object} Formatted error object
   * @protected
   */
  _formatError(error, operation) {
    if (error instanceof MCPError) {
      return {
        code: error.code,
        message: error.message,
        details: error.details
      };
    }
    
    // Handle Axios errors
    if (error.response) {
      return {
        code: MCP_ERROR_CODES.InternalError,
        message: `MCP ${operation} failed with status ${error.response.status}`,
        details: error.response.data
      };
    }
    
    // Generic error
    return {
      code: MCP_ERROR_CODES.InternalError,
      message: `MCP ${operation} failed: ${error.message}`
    };
  }

  /**
   * Ensure the client is initialized before proceeding
   * @returns {Promise<boolean>} Whether initialization succeeded
   * @protected
   */
  async _ensureInitialized() {
    if (!this.initialized) {
      return await this.initialize();
    }
    return true;
  }

  /**
   * Initialize the client - must be implemented by subclasses
   * @returns {Promise<boolean>} Whether initialization succeeded
   */
  async initialize() {
    throw new Error('Method not implemented: initialize()');
  }

  /**
   * Get context - must be implemented by subclasses
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Context response
   */
  async getContext(options = {}) {
    throw new Error('Method not implemented: getContext()');
  }

  /**
   * Get prompts suggestions - must be implemented by subclasses
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Prompts response
   */
  async getPrompts(options = {}) {
    throw new Error('Method not implemented: getPrompts()');
  }

  /**
   * Execute a tool - must be implemented by subclasses
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Tool execution response
   */
  async executeTool(options = {}) {
    throw new Error('Method not implemented: executeTool()');
  }

  /**
   * Get available tools - must be implemented by subclasses
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Available tools response
   */
  async getTools(options = {}) {
    throw new Error('Method not implemented: getTools()');
  }

  /**
   * Check health - must be implemented by subclasses
   * @returns {Promise<Object>} Health check response
   */
  async checkHealth() {
    throw new Error('Method not implemented: checkHealth()');
  }

  /**
   * Get capabilities - must be implemented by subclasses
   * @returns {Promise<Object>} Capabilities response
   */
  async getCapabilities() {
    throw new Error('Method not implemented: getCapabilities()');
  }
}