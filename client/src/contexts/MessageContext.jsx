// filepath: d:\code\openai-chat-app\client\src\contexts\MessageContext.jsx
import React, { createContext, useContext, useCallback } from 'react';
import { useMessages } from '../hooks/useMessages';
import { useMessageInput } from '../hooks/useMessageInput';
import { useConfiguration } from './ConfigurationContext';
import { useToken } from './TokenContext';

const MessageContext = createContext();

export const useMessage = () => useContext(MessageContext);

export const MessageProvider = ({ children }) => {
  const { memorySettings } = useConfiguration();
  const { updateTokenUsage, resetCurrentTokenUsage } = useToken();
  const inputState = useMessageInput();

  // Create the preparePreviousMessages function as a memoized callback
  const preparePreviousMessages = useCallback((messages) => {
    // Apply memory settings logic based on configuration
    if (memorySettings.memoryMode === 'none') {
      return [];
    } else if (memorySettings.memoryMode === 'limited') {
      return messages.slice(-memorySettings.memoryLimit);
    } else {
      // 'full' memory mode
      return [...messages];
    }
  }, [memorySettings]);

  // Pass the memoized callback to useMessages
  const messagesState = useMessages({
    updateTokenUsage,
    preparePreviousMessages
  });

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

  const handleClearChat = useCallback(() => {
    messagesState.handleClearChat();
    resetCurrentTokenUsage();
  }, [messagesState.handleClearChat, resetCurrentTokenUsage]);

  const handleSummarizeChat = useCallback(() => {
    if (messagesState.isLoading || messagesState.messages.length === 0) return;
    messagesState.handleSummarize();
  }, [messagesState.isLoading, messagesState.messages, messagesState.handleSummarize]);

  const value = {
    // Messages state
    messages: messagesState.messages,
    isLoading: messagesState.isLoading,
    isInitializing: messagesState.isInitializing,
    error: messagesState.error,
    setError: messagesState.setError,
    handleRetry: messagesState.handleRetry,
    
    // Input state
    input: inputState.input,
    setInput: inputState.setInput,
    selectedImage: inputState.selectedImage,
    setSelectedImage: inputState.setSelectedImage,
    selectedVoice: inputState.selectedVoice,
    setSelectedVoice: inputState.setSelectedVoice,
    
    // Message actions
    handleSend,
    handleClearChat,
    handleSummarizeChat
  };

  return (
    <MessageContext.Provider value={value}>
      {children}
    </MessageContext.Provider>
  );
};