import { useState, useEffect } from 'react';
import { getServerConfig, updateConfig } from '../services/chatService';

const STORAGE_KEY = 'azure-openai-config';

/**
 * Hook for managing Azure OpenAI configuration
 * @param {Object} options - Hook options
 * @param {Function} [options.onConfigSaved] - Callback for when config is saved
 * @param {Function} [options.onOpenChange] - Callback for dialog open state changes
 * @returns {Object} Configuration state and functions
 */
export const useAzureOpenAIConfig = (options = {}) => {
  // Default config values
  const defaultConfig = {
    apiKey: '',
    endpoint: '',
    deploymentName: '',
    temperature: 0.7,
    topP: 1.0,
    memoryMode: 'limited',
    memoryLimit: 6,
    includeSystemMessage: false,
    systemMessage: 'You are a helpful assistant.',
  };

  // State for configuration
  const [config, setConfig] = useState(defaultConfig);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Extract options
  const { onConfigSaved, onOpenChange } = options;

  /**
   * Set a specific config value
   * @param {string} key - The config key to update
   * @param {any} value - The new value
   */
  const setConfigValue = (key, value) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  /**
   * Clear status messages after a timeout
   * @param {number} [timeout=3000] - Timeout in milliseconds
   */
  const clearStatusMessage = (timeout = 3000) => {
    setTimeout(() => {
      setError('');
      setSuccess('');
    }, timeout);
  };

  /**
   * Load configuration on mount
   */
  useEffect(() => {
    fetchConfig();
  }, []);

  /**
   * Fetches configuration from both localStorage and server
   */
  const fetchConfig = async () => {
    try {
      setIsLoading(true);
      
      // First, try to load from localStorage
      const savedConfig = localStorage.getItem(STORAGE_KEY);
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig(prevConfig => ({
          ...prevConfig,
          ...parsedConfig
        }));
        console.log('Loaded configuration from localStorage');
      }

      // Then fetch from server to ensure we're in sync
      try {
        const data = await getServerConfig();
        
        // Merge server config with local values, prioritizing local values for API key
        // since the server returns a masked API key
        setConfig(prev => {
          // Only overwrite API key if it's not masked and not empty
          const newApiKey = 
            (!data.apiKey || data.apiKey === '********') ? prev.apiKey : data.apiKey;
          
          return {
            ...prev,
            endpoint: data.endpoint || prev.endpoint,
            deploymentName: data.deploymentName || prev.deploymentName,
            temperature: data.temperature !== undefined ? data.temperature : prev.temperature,
            topP: data.topP !== undefined ? data.topP : prev.topP,
            apiKey: newApiKey,
            memoryMode: data.memoryMode || prev.memoryMode,
            memoryLimit: data.memoryLimit !== undefined ? data.memoryLimit : prev.memoryLimit,
            includeSystemMessage: data.includeSystemMessage !== undefined ? data.includeSystemMessage : prev.includeSystemMessage,
            systemMessage: data.systemMessage || prev.systemMessage,
          };
        });
        console.log('Synchronized config with server');
      } catch (serverError) {
        console.error('Error fetching config from server:', serverError);
        // If we can't reach the server but have local config, we'll use that
      }
    } catch (error) {
      console.error('Error fetching config:', error);
      setError('Failed to load configuration');
      clearStatusMessage();
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Saves the current configuration to both localStorage and server
   */
  const saveConfig = async () => {
    try {
      setIsLoading(true);
      
      // Validate required fields
      if (!config.apiKey || !config.endpoint || !config.deploymentName) {
        setError('Please fill in all required fields');
        clearStatusMessage();
        setIsLoading(false);
        return;
      }

      // Save to localStorage first
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      console.log('Saved configuration to localStorage');

      // Save to server
      try {
        await updateConfig(config);
        console.log('Saved configuration to server');
      } catch (serverError) {
        console.error('Server config save error:', serverError);
        // Even if server save fails, we've saved to localStorage
        setSuccess('Configuration saved locally, but server update failed');
        clearStatusMessage();
        
        // Still trigger the onConfigSaved callback
        if (onConfigSaved) {
          onConfigSaved(config);
        }
        setIsLoading(false);
        return;
      }

      // All good! Update UI and notify parent
      setSuccess('Configuration saved successfully');
      
      // Call the parent callback to update the app's configuration state
      if (onConfigSaved) {
        onConfigSaved(config);
      }
      
      // Close the dialog after successful save
      setTimeout(() => {
        if (onOpenChange) {
          onOpenChange(false);
        }
      }, 1000);
      
      clearStatusMessage();
    } catch (error) {
      console.error('Error saving config:', error);
      setError('Failed to save configuration');
      clearStatusMessage();
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Reset configuration to defaults
   */
  const resetConfig = () => {
    setConfig(defaultConfig);
  };

  return {
    config,
    setConfig,
    setConfigValue,
    saveConfig,
    resetConfig,
    error,
    success,
    isLoading,
    fetchConfig
  };
};
