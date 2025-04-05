// filepath: d:\code\openai-chat-app\client\src\contexts\ConfigurationContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getServerConfig, checkConfiguration, updateConfig } from '../services/chatService';
import { loadConfig } from '../services/storageService';
import { useMemorySettings } from '../hooks/useMemorySettings';

const ConfigurationContext = createContext();

export const useConfiguration = () => useContext(ConfigurationContext);

export const ConfigurationProvider = ({ children }) => {
  const memoryState = useMemorySettings();
  const [isConfigured, setIsConfigured] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);
  const [autoInitialized, setAutoInitialized] = useState(false);
  const [useAiAgentService, setUseAiAgentService] = useState(false);

  // Load configuration on mount
  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      const localConfig = loadConfig();
      
      if (localConfig) {
        // Update memory settings from local config
        memoryState.updateMemorySettings({
          memoryMode: localConfig.memoryMode || 'limited',
          memoryLimit: localConfig.memoryLimit || 6,
          includeSystemMessage: localConfig.includeSystemMessage || false,
          systemMessage: localConfig.systemMessage || 'You are a helpful assistant.'
        });

        // Check if using AI Agent Service
        if (localConfig.useAiAgentService) {
          setUseAiAgentService(true);
        }

        if ((localConfig.useAiAgentService && localConfig.apiKey && localConfig.aiAgentEndpoint && 
           localConfig.aiAgentProjectName && localConfig.aiAgentId) || 
           (!localConfig.useAiAgentService && localConfig.apiKey && localConfig.endpoint && localConfig.deploymentName)) {
          
          console.log('Found valid configuration, automatically initializing connection');
          
          // Update the server configuration with the local one to ensure they are in sync
          try {
            await updateConfig(localConfig);
            console.log('Successfully synchronized configuration');
          } catch (updateError) {
            console.error('Error updating server configuration:', updateError);
            // Continue with initialization even if server update fails
          }
          
          await refreshConfiguration();
          setAutoInitialized(true);
        } else {
          console.log('Configuration is incomplete, skipping auto-initialization');
          refreshConfiguration(); // Still check configuration state but don't wait for it
        }
      } else {
        try {
          const serverConfig = await getServerConfig();
          if (serverConfig) {
            memoryState.updateMemorySettings({
              memoryMode: serverConfig.memoryMode || 'limited',
              memoryLimit: serverConfig.memoryLimit || 6,
              includeSystemMessage: serverConfig.includeSystemMessage || false,
              systemMessage: serverConfig.systemMessage || 'You are a helpful assistant.'
            });
            
            // Check if using AI Agent Service from server config
            if (serverConfig.useAiAgentService) {
              setUseAiAgentService(serverConfig.useAiAgentService);
            }
            
            refreshConfiguration();
          }
        } catch (serverConfigError) {
          console.error('Error fetching server config:', serverConfigError);
        }
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
    }
  };

  const refreshConfiguration = async () => {
    try {
      setConfigLoading(true);
      const configured = await checkConfiguration();
      setIsConfigured(configured);
      
      // Update useAiAgentService when refreshing config
      try {
        const serverConfig = await getServerConfig();
        if (serverConfig && serverConfig.useAiAgentService !== undefined) {
          setUseAiAgentService(serverConfig.useAiAgentService);
        }
      } catch (error) {
        console.error('Error getting server config:', error);
      }
      
    } catch (error) {
      console.error('Error checking configuration:', error);
      setIsConfigured(false);
    } finally {
      setConfigLoading(false);
    }
  };

  const value = {
    isConfigured,
    configLoading,
    refreshConfiguration,
    memorySettings: memoryState.memorySettings,
    updateMemorySettings: memoryState.updateMemorySettings,
    autoInitialized,
    useAiAgentService
  };

  return (
    <ConfigurationContext.Provider value={value}>
      {children}
    </ConfigurationContext.Provider>
  );
};