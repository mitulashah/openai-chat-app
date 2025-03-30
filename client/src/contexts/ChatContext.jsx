import React, { createContext, useContext, useEffect, useCallback, useMemo, useState } from 'react';
import { getServerConfig } from '../services/chatService';
import { loadConfig } from '../services/storageService';

// Import all our specialized hooks
import { useMessages } from '../hooks/useMessages';
import { useMessageInput } from '../hooks/useMessageInput';
import { useMemorySettings } from '../hooks/useMemorySettings';
import { useTokenUsage } from '../hooks/useTokenUsage';
import { useConfigurationUI } from '../hooks/useConfigurationUI';

// Create the context
const ChatContext = createContext();

// Custom hook to use the chat context
export const useChat = () => useContext(ChatContext);

// Provider component for the chat context
export const ChatProvider = ({ children }) => {
  // Use our specialized hooks
  const configUI = useConfigurationUI();
  const tokenUsageState = useTokenUsage();
  const memoryState = useMemorySettings();
  const inputState = useMessageInput();
  
  // Create the preparePreviousMessages function as a memoized callback
  // This eliminates the circular dependency issue
  const preparePreviousMessages = useCallback((messages) => {
    return memoryState.preparePreviousMessages(messages);
  }, [memoryState]);
  
  // Pass the memoized callback to useMessages
  const messagesState = useMessages({
    updateTokenUsage: tokenUsageState.updateTokenUsage,
    preparePreviousMessages
  });

  // Load configuration on mount - using an empty dependency array to ensure it only runs once
  useEffect(() => {
    loadConfiguration();
    
    // Check if the API is configured
    configUI.refreshConfiguration();
  }, []); // Changed from [configUI] to [] to prevent excessive calls

  // Function to load memory settings from configuration
  const loadConfiguration = async () => {
    try {
      // First, check localStorage for saved config using storageService
      const localConfig = loadConfig();
      
      if (localConfig) {
        // Update memory settings from the config
        if (localConfig.memoryMode) {
          memoryState.updateMemorySettings({
            memoryMode: localConfig.memoryMode || 'limited',
            memoryLimit: localConfig.memoryLimit || 6,
            includeSystemMessage: localConfig.includeSystemMessage || false,
            systemMessage: localConfig.systemMessage || 'You are a helpful assistant.'
          });
        }
      } else {
        // If no localStorage config exists, try to get server config
        try {
          const serverConfig = await getServerConfig();
          if (serverConfig) {
            // Update memory settings from server config
            memoryState.updateMemorySettings({
              memoryMode: serverConfig.memoryMode || 'limited',
              memoryLimit: serverConfig.memoryLimit || 6,
              includeSystemMessage: serverConfig.includeSystemMessage || false,
              systemMessage: serverConfig.systemMessage || 'You are a helpful assistant.'
            });
          }
        } catch (serverConfigError) {
          console.error('Error fetching server config:', serverConfigError);
        }
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
    }
  };

  // Function to handle sending a message - memoized to prevent unnecessary recreations
  const handleSend = useCallback(async (messageText, selectedImg, selectedVoiceRec) => {
    // If direct parameters are provided, use those instead of state values
    const messageToSend = messageText !== undefined ? messageText : inputState.input;
    const imageToSend = selectedImg !== undefined ? selectedImg : inputState.selectedImage;
    const voiceToSend = selectedVoiceRec !== undefined ? selectedVoiceRec : inputState.selectedVoice;
    
    if (!messageToSend.trim() && !imageToSend && !voiceToSend) return;
    if (messagesState.isLoading) return;

    // Send the message using our messages hook
    await messagesState.handleSend(
      messageToSend,
      imageToSend,
      voiceToSend
    );
    
    // Reset the input fields only if we used the state values
    // When called from MessageInput with explicit params, input is already cleared
    if (messageText === undefined) {
      inputState.resetInputs();
    } else {
      // If only clearing attachments
      if (imageToSend) inputState.setSelectedImage(null);
      if (voiceToSend) inputState.setSelectedVoice(null);
    }
  }, [
    inputState.input, 
    inputState.selectedImage, 
    inputState.selectedVoice, 
    inputState.resetInputs,
    inputState.setSelectedImage,
    inputState.setSelectedVoice,
    messagesState.handleSend,
    messagesState.isLoading
  ]);

  // Function to clear the chat - memoized to prevent unnecessary recreations
  const handleClearChat = useCallback(() => {
    messagesState.handleClearChat();
    tokenUsageState.resetCurrentTokenUsage();
  }, [messagesState.handleClearChat, tokenUsageState.resetCurrentTokenUsage]);

  // Function to handle summarizing the chat - memoized to prevent unnecessary recreations
  const handleSummarizeChat = useCallback(() => {
    if (messagesState.isLoading || messagesState.messages.length === 0) return;
    messagesState.handleSummarize();
  }, [messagesState.isLoading, messagesState.messages.length, messagesState.handleSummarize]);

  // Combine all states and functions from our hooks using useMemo for performance
  const contextValue = useMemo(() => ({
    // From useMessages
    messages: messagesState.messages,
    isLoading: messagesState.isLoading,
    isInitializing: messagesState.isInitializing,
    error: messagesState.error,
    setError: messagesState.setError,
    handleRetry: messagesState.handleRetry,
    
    // From useMessageInput
    input: inputState.input,
    setInput: inputState.setInput,
    selectedImage: inputState.selectedImage,
    setSelectedImage: inputState.setSelectedImage,
    selectedVoice: inputState.selectedVoice,
    setSelectedVoice: inputState.setSelectedVoice,
    
    // From useConfigurationUI
    isConfigured: configUI.isConfigured,
    configLoading: configUI.configLoading,
    refreshConfiguration: configUI.refreshConfiguration,
    isAdminPanelOpen: configUI.isAdminPanelOpen,
    setIsAdminPanelOpen: configUI.setIsAdminPanelOpen,
    
    // From useMemorySettings
    memorySettings: memoryState.memorySettings,
    updateMemorySettings: memoryState.updateMemorySettings,
    
    // From useTokenUsage
    tokenUsage: tokenUsageState.tokenUsage,
    
    // Combined functions
    handleSend,
    handleClearChat,
    handleSummarizeChat
  }), [
    messagesState.messages,
    messagesState.isLoading,
    messagesState.isInitializing,
    messagesState.error,
    messagesState.setError,
    messagesState.handleRetry,
    inputState.input,
    inputState.setInput,
    inputState.selectedImage,
    inputState.setSelectedImage,
    inputState.selectedVoice,
    inputState.setSelectedVoice,
    configUI.isConfigured,
    configUI.configLoading,
    configUI.refreshConfiguration,
    configUI.isAdminPanelOpen,
    configUI.setIsAdminPanelOpen,
    memoryState.memorySettings,
    memoryState.updateMemorySettings,
    tokenUsageState.tokenUsage,
    handleSend,
    handleClearChat,
    handleSummarizeChat
  ]);

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};