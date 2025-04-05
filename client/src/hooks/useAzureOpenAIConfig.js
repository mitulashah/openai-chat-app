import { useState, useEffect } from 'react';
import { getServerConfig, updateConfig } from '../services/chatService';
import { loadConfig, saveConfig } from '../services/storageService';

/**
 * Hook for managing Azure AI service configuration (OpenAI and AI Agent)
 * @param {Object} options - Hook options
 * @param {Function} [options.onConfigSaved] - Callback for when config is saved
 * @param {Function} [options.onOpenChange] - Callback for dialog open state changes
 * @returns {Object} Configuration state and functions
 */
export const useAzureOpenAIConfig = (options = {}) => {
  // Default config values
  const defaultConfig = {
    // Azure OpenAI settings
    apiKey: '',
    endpoint: '',
    deploymentName: '',
    temperature: 0.7,
    topP: 1.0,
    memoryMode: 'limited',
    memoryLimit: 6,
    includeSystemMessage: false,
    systemMessage: 'You are a helpful assistant.',
    apiVersion: '2023-05-15',
    maxTokens: 800,
    
    // Azure AI Agent service settings
    useAiAgentService: false,
    aiAgentEndpoint: '',
    aiAgentProjectName: '',
    aiAgentName: '',
    aiAgentInstructions: 'You are a helpful assistant.',
    aiAgentModel: 'gpt-4o-mini'
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
      
      // First, try to load from localStorage using storageService
      const localConfig = loadConfig();
      if (localConfig) {
        setConfig(prevConfig => ({
          ...prevConfig,
          ...localConfig
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
            // Azure OpenAI settings
            endpoint: data.endpoint || prev.endpoint,
            deploymentName: data.deploymentName || prev.deploymentName,
            temperature: data.temperature !== undefined ? data.temperature : prev.temperature,
            topP: data.topP !== undefined ? data.topP : prev.topP,
            apiKey: newApiKey,
            memoryMode: data.memoryMode || prev.memoryMode,
            memoryLimit: data.memoryLimit !== undefined ? data.memoryLimit : prev.memoryLimit,
            includeSystemMessage: data.includeSystemMessage !== undefined ? data.includeSystemMessage : prev.includeSystemMessage,
            systemMessage: data.systemMessage || prev.systemMessage,
            apiVersion: data.apiVersion || prev.apiVersion,
            maxTokens: data.maxTokens !== undefined ? data.maxTokens : prev.maxTokens,
            
            // Azure AI Agent service settings
            useAiAgentService: data.useAiAgentService !== undefined ? data.useAiAgentService : prev.useAiAgentService,
            aiAgentEndpoint: data.aiAgentEndpoint || prev.aiAgentEndpoint,
            aiAgentProjectName: data.aiAgentProjectName || prev.aiAgentProjectName,
            aiAgentName: data.aiAgentName || prev.aiAgentName,
            aiAgentInstructions: data.aiAgentInstructions || prev.aiAgentInstructions,
            aiAgentModel: data.aiAgentModel || prev.aiAgentModel
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
  const saveConfigHandler = async () => {
    try {
      setIsLoading(true);
      
      // Validate required fields based on selected service
      if (config.useAiAgentService) {
        if (!config.apiKey || !config.aiAgentEndpoint || !config.aiAgentProjectName || !config.aiAgentName) {
          setError('Please fill in all required Azure AI Agent fields');
          clearStatusMessage();
          setIsLoading(false);
          return;
        }
      } else {
        if (!config.apiKey || !config.endpoint || !config.deploymentName) {
          setError('Please fill in all required Azure OpenAI fields');
          clearStatusMessage();
          setIsLoading(false);
          return;
        }
      }

      // Save to localStorage using storageService
      saveConfig(config);
      console.log('Saved configuration to localStorage');

      // Save to server
      try {
        await updateConfig(config);
        console.log('Saved configuration to server');
      } catch (serverError) {
        console.error('Server config save error:', serverError);
        // If server save fails, show error and keep modal open
        setError('Server update failed: ' + (serverError.message || 'Unknown error'));
        clearStatusMessage();
        
        // Still trigger the onConfigSaved callback to update local state
        if (onConfigSaved) {
          onConfigSaved(config);
        }
        setIsLoading(false);
        return;
      }

      // Call the parent callback to update the app's configuration state
      if (onConfigSaved) {
        onConfigSaved(config);
      }
      
      // Close the dialog immediately on success without showing a message
      if (onOpenChange) {
        onOpenChange(false);
      }
      
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
    saveConfig: saveConfigHandler,
    resetConfig,
    error,
    success,
    isLoading,
    fetchConfig
  };
};
