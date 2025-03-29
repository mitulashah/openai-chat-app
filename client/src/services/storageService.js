// filepath: c:\Users\mitulshah\OneDrive - Microsoft\Code\openai-chat-app\client\src\services\storageService.js
/**
 * Centralized storage service to manage all localStorage operations
 * This provides a single point of control for storage keys and operations
 */

// Storage key constants
export const STORAGE_KEYS = {
  MESSAGES: 'azure-openai-chat-history',
  CONFIG: 'azure-openai-config',
  THEME: 'app-theme'
};

// Prefix for all storage keys to avoid conflicts with other apps
const APP_PREFIX = 'ai-chat-app:';

/**
 * Get the prefixed storage key
 * @param {string} key - The base key
 * @returns {string} - The prefixed key
 */
const getPrefixedKey = (key) => `${APP_PREFIX}${key}`;

/**
 * Retrieve an item from localStorage
 * @param {string} key - The storage key
 * @param {any} defaultValue - Default value if the key doesn't exist
 * @returns {any} - The stored value or default value
 */
export const getItem = (key, defaultValue = null) => {
  try {
    const prefixedKey = getPrefixedKey(key);
    const item = localStorage.getItem(prefixedKey);
    
    if (item === null) {
      return defaultValue;
    }
    
    return JSON.parse(item);
  } catch (error) {
    console.error(`Error retrieving item from storage [${key}]:`, error);
    return defaultValue;
  }
};

/**
 * Store an item in localStorage
 * @param {string} key - The storage key
 * @param {any} value - The value to store
 * @returns {boolean} - Whether the operation was successful
 */
export const setItem = (key, value) => {
  try {
    const prefixedKey = getPrefixedKey(key);
    localStorage.setItem(prefixedKey, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error storing item in storage [${key}]:`, error);
    return false;
  }
};

/**
 * Remove an item from localStorage
 * @param {string} key - The storage key
 * @returns {boolean} - Whether the operation was successful
 */
export const removeItem = (key) => {
  try {
    const prefixedKey = getPrefixedKey(key);
    localStorage.removeItem(prefixedKey);
    return true;
  } catch (error) {
    console.error(`Error removing item from storage [${key}]:`, error);
    return false;
  }
};

/**
 * Clear all app-related items from localStorage
 * @returns {boolean} - Whether the operation was successful
 */
export const clearAll = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      removeItem(key);
    });
    return true;
  } catch (error) {
    console.error('Error clearing all items from storage:', error);
    return false;
  }
};

/**
 * Save chat messages to localStorage
 * @param {Array} messages - The chat messages to save
 * @returns {boolean} - Whether the operation was successful
 */
export const saveMessages = (messages) => {
  return setItem(STORAGE_KEYS.MESSAGES, messages);
};

/**
 * Load chat messages from localStorage
 * @returns {Array} - The stored chat messages or empty array
 */
export const loadMessages = () => {
  return getItem(STORAGE_KEYS.MESSAGES, []);
};

/**
 * Save app configuration to localStorage
 * @param {Object} config - The app configuration to save
 * @returns {boolean} - Whether the operation was successful
 */
export const saveConfig = (config) => {
  return setItem(STORAGE_KEYS.CONFIG, config);
};

/**
 * Load app configuration from localStorage
 * @returns {Object|null} - The stored configuration or null
 */
export const loadConfig = () => {
  return getItem(STORAGE_KEYS.CONFIG, null);
};

/**
 * Save theme preference to localStorage
 * @param {string} themeName - The theme name to save
 * @returns {boolean} - Whether the operation was successful
 */
export const saveTheme = (themeName) => {
  return setItem(STORAGE_KEYS.THEME, themeName);
};

/**
 * Load theme preference from localStorage
 * @param {string|null} defaultTheme - Default theme if none is stored, or null to indicate no default
 * @returns {string|null} - The stored theme name, default, or null
 */
export const loadTheme = (defaultTheme = 'light') => {
  const prefixedKey = getPrefixedKey(STORAGE_KEYS.THEME);
  try {
    // Check if the item exists in localStorage first
    if (localStorage.getItem(prefixedKey) === null) {
      return defaultTheme; // Return the default (which could be null)
    }
    
    // Item exists, try to parse it
    return JSON.parse(localStorage.getItem(prefixedKey));
  } catch (error) {
    console.error(`Error retrieving theme from storage:`, error);
    return defaultTheme;
  }
};