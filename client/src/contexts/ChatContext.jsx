import React, { createContext, useContext, useState, useEffect } from 'react';
import { checkConfiguration, sendMessage, getServerConfig } from '../services/chatService';

// Create the context
const ChatContext = createContext();

// Custom hook to use the chat context
export const useChat = () => useContext(ChatContext);

// Storage keys
const CONFIG_STORAGE_KEY = 'azure-openai-config';
const MESSAGES_STORAGE_KEY = 'azure-openai-chat-history';

// Provider component for the chat context
export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState(() => {
    // Load saved messages from localStorage on initial render
    const savedMessages = localStorage.getItem(MESSAGES_STORAGE_KEY);
    return savedMessages ? JSON.parse(savedMessages) : [];
  });
  const [input, setInput] = useState('');
  const [error, setError] = useState(''); // Keep the general error state for backward compatibility
  const [isConfigured, setIsConfigured] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);
  const [memorySettings, setMemorySettings] = useState({
    memoryMode: 'limited',
    memoryLimit: 6,
    includeSystemMessage: false,
    systemMessage: 'You are a helpful assistant.'
  });
  const [tokenUsage, setTokenUsage] = useState({
    total: 0,
    current: {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0
    }
  });

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  // Function to check if the API is configured and load memory settings
  const refreshConfiguration = async () => {
    try {
      setConfigLoading(true);
      // First, check localStorage for saved config
      const savedConfig = localStorage.getItem(CONFIG_STORAGE_KEY);
      
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        
        // If we have config in localStorage with all required fields, send it to the server
        if (parsedConfig.apiKey && parsedConfig.endpoint && parsedConfig.deploymentName) {
          console.log('Loading configuration from localStorage');
          
          // Send the saved config to the server
          const response = await fetch('/api/config', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(parsedConfig),
          });
          
          if (response.ok) {
            console.log('Configuration from localStorage applied to server successfully');
            
            // Update memory settings from the config
            if (parsedConfig.memoryMode) {
              setMemorySettings({
                memoryMode: parsedConfig.memoryMode || 'limited',
                memoryLimit: parsedConfig.memoryLimit || 6,
                includeSystemMessage: parsedConfig.includeSystemMessage || false,
                systemMessage: parsedConfig.systemMessage || 'You are a helpful assistant.'
              });
            }
          }
        }
      } else {
        // If no localStorage config exists, try to get server config
        try {
          const serverConfig = await getServerConfig();
          if (serverConfig) {
            // Update memory settings from server config
            setMemorySettings({
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
      
      // Check if the API is configured after potentially applying localStorage config
      const configured = await checkConfiguration();
      setIsConfigured(configured);
    } catch (error) {
      console.error('Error refreshing configuration:', error);
      setIsConfigured(false);
    } finally {
      setConfigLoading(false);
    }
  };

  useEffect(() => {
    // Check if the API is configured when the component mounts
    refreshConfiguration();
  }, []);

  // Function to prepare previous messages based on memory settings
  const preparePreviousMessages = () => {
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
  };

  // Function to handle retrying a failed message
  const handleRetry = async (failedMessageId, originalInput, originalImage, originalVoice) => {
    if (isLoading) return Promise.reject(new Error('Already loading')); // Prevent multiple retries while loading
    
    setIsLoading(true);
    
    try {
      // First, create and add the AI loading message without touching the failed message yet
      const tempLoadingId = Date.now();
      
      // Update messages in a single operation to avoid multiple re-renders
      setMessages(prev => {
        // Create a copy of the messages array
        const updatedMessages = [...prev];
        
        // Find the failed message index 
        const failedMessageIndex = updatedMessages.findIndex(msg => msg.id === failedMessageId);
        
        // Only proceed if we found the message
        if (failedMessageIndex !== -1) {
          // Mark it as retrying without changing other properties, preserving URLs
          updatedMessages[failedMessageIndex] = {
            ...updatedMessages[failedMessageIndex],
            isRetrying: true,
            hasError: false,
            error: null
          };
        }
        
        // Add the AI loading message at the end
        updatedMessages.push({
          id: tempLoadingId,
          text: '',
          sender: 'ai',
          isLoading: true,
          timestamp: new Date().toISOString(),
        });
        
        return updatedMessages;
      });

      // Get previous messages according to memory settings
      const previousMessages = preparePreviousMessages();

      // Send message to the API service with conversation history
      const data = await sendMessage(originalInput, originalImage, originalVoice, previousMessages);
      
      // Update token usage statistics
      if (data.tokenUsage) {
        setTokenUsage(prev => ({
          total: prev.total + data.tokenUsage.totalTokens,
          current: data.tokenUsage
        }));
      }
      
      // Update messages again to show the success state
      setMessages(prev => {
        // Create a copy with the loading message removed
        const messagesWithoutLoading = prev.filter(m => m.id !== tempLoadingId);
        
        // Find the retrying message
        const retryingMessageIndex = messagesWithoutLoading.findIndex(msg => msg.id === failedMessageId);
        
        // Update the retrying message
        if (retryingMessageIndex !== -1) {
          messagesWithoutLoading[retryingMessageIndex] = {
            ...messagesWithoutLoading[retryingMessageIndex],
            isRetrying: false
          };
        }
        
        // Add the AI response at the end
        return [
          ...messagesWithoutLoading,
          {
            id: Date.now(),
            text: data.message,
            sender: 'ai',
            timestamp: data.timestamp,
            tokenUsage: data.tokenUsage
          }
        ];
      });
      
      // Clear any general error
      setError('');
      return Promise.resolve();
    } catch (error) {
      console.error('Error retrying message:', error);
      
      // Update the original message to show the retry failed
      setMessages(prev => {
        // Find and update only the failed message
        return prev.map(msg => 
          msg.id === failedMessageId 
            ? { 
                ...msg, 
                isRetrying: false,
                hasError: true,
                error: error.message
              } 
            : msg
        ).filter(m => !m.isLoading); // Remove any loading messages
      });
      
      return Promise.reject(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle sending a message
  const handleSend = async () => {
    if (!input.trim() && !selectedImage && !selectedVoice) return;
    if (isLoading) return; // Prevent multiple sends while loading

    setIsLoading(true);
    const originalInput = input;
    const originalImage = selectedImage;
    const originalVoice = selectedVoice;

    // Create and add user message to the chat with a unique ID
    const userMessageId = Date.now();
    const userMessage = {
      id: userMessageId,
      text: input,
      sender: 'user',
      timestamp: new Date().toISOString(),
      image: selectedImage ? URL.createObjectURL(selectedImage) : null,
      voice: selectedVoice ? URL.createObjectURL(selectedVoice) : null,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setError('');

    try {
      // Add a temporary loading message
      const tempLoadingId = Date.now() + 1;
      setMessages(prev => [...prev, {
        id: tempLoadingId,
        text: '',
        sender: 'ai',
        isLoading: true,
        timestamp: new Date().toISOString(),
      }]);

      // Get previous messages according to memory settings
      // We need to get this after adding the user message but before the loading message
      const previousMessages = preparePreviousMessages().filter(msg => msg.id !== tempLoadingId);

      // Send message to the API service with conversation history
      const data = await sendMessage(originalInput, originalImage, originalVoice, previousMessages);
      
      // Update token usage statistics
      if (data.tokenUsage) {
        setTokenUsage(prev => ({
          total: prev.total + data.tokenUsage.totalTokens,
          current: data.tokenUsage
        }));
      }
      
      // Replace the loading message with the actual AI response
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== tempLoadingId);
        return [...filtered, {
          id: Date.now() + 2,
          text: data.message,
          sender: 'ai',
          timestamp: data.timestamp,
          tokenUsage: data.tokenUsage
        }];
      });
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Instead of setting a general error, mark the user message as failed
      setMessages(prev => {
        // First, remove the loading message
        const withoutLoading = prev.filter(m => !m.isLoading);
        
        // Then, mark the user message with the error
        return withoutLoading.map(msg => 
          msg.id === userMessageId
            ? { 
                ...msg,
                hasError: true,
                error: error.message,
                originalInput: originalInput,
                // Store references to the original files for retry functionality
                originalImage: originalImage,
                originalVoice: originalVoice
              }
            : msg
        );
      });
    } finally {
      setIsLoading(false);
      // Always clear the selected image and voice regardless of success or failure
      setSelectedImage(null);
      setSelectedVoice(null);
    }
  };

  // Function to clear the chat
  const handleClearChat = () => {
    setMessages([]);
    setError('');
    // Also clear from localStorage
    localStorage.removeItem(MESSAGES_STORAGE_KEY);
    // Reset token usage but keep total for reference
    setTokenUsage(prev => ({
      total: prev.total,
      current: { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
    }));
  };

  // Update memory settings
  const updateMemorySettings = (newSettings) => {
    setMemorySettings(prev => ({
      ...prev,
      ...newSettings
    }));
  };

  const contextValue = {
    messages,
    input,
    setInput,
    error,
    setError,
    isConfigured,
    refreshConfiguration,
    selectedImage,
    setSelectedImage,
    selectedVoice,
    setSelectedVoice,
    isAdminPanelOpen,
    setIsAdminPanelOpen,
    handleSend,
    handleClearChat,
    handleRetry,
    isLoading,
    configLoading,
    memorySettings,
    updateMemorySettings,
    tokenUsage
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};