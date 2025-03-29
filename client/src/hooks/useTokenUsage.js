import { useState } from 'react';

/**
 * Custom hook for tracking token usage
 * @param {Object} initialData - Initial token usage data
 * @returns {Object} Token usage state and functions
 */
export const useTokenUsage = (initialData = {}) => {
  const [tokenUsage, setTokenUsage] = useState({
    total: 0,
    current: {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0
    },
    ...initialData
  });

  /**
   * Update token usage with new data from an API response
   * @param {Object} newUsage - Token usage data from API
   */
  const updateTokenUsage = (newUsage) => {
    if (!newUsage) return;
    
    setTokenUsage(prev => ({
      total: prev.total + newUsage.totalTokens,
      current: newUsage
    }));
  };

  /**
   * Reset current token usage but maintain total
   */
  const resetCurrentTokenUsage = () => {
    setTokenUsage(prev => ({
      total: prev.total,
      current: { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
    }));
  };

  return {
    tokenUsage,
    updateTokenUsage,
    resetCurrentTokenUsage
  };
};