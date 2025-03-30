/**
 * Utility functions for the chat application
 */

/**
 * Format a number with commas as thousands separators
 * @param {number} num - The number to format
 * @returns {string} The formatted number with commas
 */
export const formatNumber = (num) => {
  if (num === undefined || num === null) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

/**
 * Format a timestamp into a human-readable time
 * @param {string} timestamp - ISO timestamp string
 * @param {Object} options - Formatting options
 * @returns {string} The formatted time string
 */
export const formatTimestamp = (timestamp, options = {}) => {
  if (!timestamp) return '';
  
  try {
    return new Date(timestamp).toLocaleTimeString(
      options.locale || undefined, 
      options.formatOptions || undefined
    );
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return '';
  }
};

/**
 * Get a user-friendly error message
 * @param {string} errorMsg - The raw error message
 * @returns {string} A user-friendly error message
 */
export const getErrorMessage = (errorMsg) => {
  if (!errorMsg) return 'An error occurred';
  
  // Handle known error patterns
  if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError')) {
    return 'Network error - please check your connection';
  }
  
  if (errorMsg.includes('Authorization')) {
    return 'Authentication error - please check your API key';
  }
  
  if (errorMsg.includes('429') || errorMsg.includes('rate limit')) {
    return 'Rate limit exceeded - please try again later';
  }
  
  // If the error is already short and user-friendly, return it directly
  if (errorMsg.length < 100 && !errorMsg.includes('{') && !errorMsg.includes('Error:')) {
    return errorMsg;
  }
  
  // Otherwise, provide a generic message
  return 'Error communicating with AI service';
};

/**
 * Get memory mode display text
 * @param {Object} memorySettings - The memory settings object
 * @returns {string} Display text for the current memory mode
 */
export const getMemoryModeDisplay = (memorySettings) => {
  if (!memorySettings) return 'Limited Memory';
  
  switch(memorySettings.memoryMode) {
    case 'none': return 'No Memory';
    case 'limited': return `Limited (${memorySettings.memoryLimit} messages)`;
    case 'full': return 'Full Memory';
    default: return 'Limited Memory';
  }
};

/**
 * Generate a unique ID
 * @returns {number} A timestamp-based unique ID
 */
export const generateId = () => {
  return Date.now() + Math.floor(Math.random() * 1000);
};