/**
 * Application-wide constants
 * Following the UPPER_SNAKE_CASE naming convention for constants
 */

// App information
export const APP_INFO = {
  TITLE: "Mitul's AI Chat",
  VERSION: "0.7",
};

// Theme names
export const THEMES = {
  LIGHT_DRACULA: 'light',
  DARK_DRACULA: 'dark',
  LIGHT_NORD: 'lightNord',
  DARK_NORD: 'darkNord',
};

// Memory modes
export const MEMORY_MODES = {
  NONE: 'none',
  LIMITED: 'limited',
  FULL: 'full',
};

// Auth types for MCP servers
export const AUTH_TYPES = {
  NONE: 'none',
  API_KEY: 'apiKey',
  BASIC: 'basic',
  BEARER: 'bearer',
};

// Message sender types
export const SENDER_TYPES = {
  USER: 'user',
  AI: 'ai',
  SYSTEM: 'system',
};

// Export file formats
export const EXPORT_FORMATS = {
  TEXT: 'txt',
  MARKDOWN: 'md',
  PDF: 'pdf',
};

// Token usage defaults
export const TOKEN_DEFAULTS = {
  PROMPT_TOKENS: 0,
  COMPLETION_TOKENS: 0,
  TOTAL_TOKENS: 0,
};

// UI States
export const UI_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  ERROR: 'error',
  SUCCESS: 'success',
};