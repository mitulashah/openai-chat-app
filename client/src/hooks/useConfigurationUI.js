import { useState } from 'react';
import { checkConfiguration } from '../services/chatService';

/**
 * Custom hook for managing UI state related to configuration and admin panel
 * @returns {Object} Configuration UI state and functions
 */
export const useConfigurationUI = () => {
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);

  /**
   * Check if the API is properly configured
   */
  const refreshConfiguration = async () => {
    try {
      setConfigLoading(true);
      const configured = await checkConfiguration();
      setIsConfigured(configured);
    } catch (error) {
      console.error('Error checking configuration:', error);
      setIsConfigured(false);
    } finally {
      setConfigLoading(false);
    }
  };

  return {
    isAdminPanelOpen,
    setIsAdminPanelOpen,
    isConfigured,
    setIsConfigured,
    configLoading,
    refreshConfiguration
  };
};