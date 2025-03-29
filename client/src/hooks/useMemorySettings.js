import { useState, useCallback } from 'react';

/**
 * Custom hook for managing memory settings
 * @param {Object} initialSettings - Initial memory settings
 * @returns {Object} Memory settings state and functions
 */
export const useMemorySettings = (initialSettings = {}) => {
  const [memorySettings, setMemorySettings] = useState({
    memoryMode: 'limited',
    memoryLimit: 6,
    includeSystemMessage: false,
    systemMessage: 'You are a helpful assistant.',
    ...initialSettings
  });

  /**
   * Update memory settings
   * @param {Object} newSettings - New settings to apply
   */
  const updateMemorySettings = useCallback((newSettings) => {
    setMemorySettings(prev => ({
      ...prev,
      ...newSettings
    }));
  }, []);

  /**
   * Prepare previous messages based on memory settings
   * @param {Array} messages - All messages in the chat
   * @returns {Array} Messages to include in the next API call
   */
  const preparePreviousMessages = useCallback((messages) => {
    // If memory mode is 'none', don't pass any history
    if (memorySettings.memoryMode === 'none') {
      return [];
    }
    
    // If memory mode is 'limited', only include a limited number of latest messages
    if (memorySettings.memoryMode === 'limited') {
      const limit = memorySettings.memoryLimit * 2; // Limit is in pairs (user + assistant)
      return messages.slice(-limit);
    }
    
    // For 'full' memory mode, include all messages
    return messages;
  }, [memorySettings.memoryMode, memorySettings.memoryLimit]);

  return {
    memorySettings,
    updateMemorySettings,
    preparePreviousMessages
  };
};