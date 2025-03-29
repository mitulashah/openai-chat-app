import { useState, useEffect, useCallback } from 'react';
import { sendMessage } from '../services/chatService';
import { loadMessages, saveMessages } from '../services/storageService';

/**
 * Custom hook for managing chat messages
 * @param {Object} options - Hook options
 * @param {Function} options.updateTokenUsage - Function to update token usage statistics
 * @param {Function} options.preparePreviousMessages - Function to get previous messages based on memory settings
 * @returns {Object} Message state and functions
 */
export const useMessages = ({ updateTokenUsage, preparePreviousMessages }) => {
  // Initialize messages from storage service
  const [messages, setMessages] = useState(() => {
    return loadMessages();
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState('');

  // Save messages to storage service whenever they change
  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  // Simulate initial loading to show skeleton UI
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 800); // Show skeleton UI for a short time
    
    return () => clearTimeout(timer);
  }, []);

  /**
   * Handle sending a new message
   * @param {string} input - Text input
   * @param {File|null} selectedImage - Optional image file
   * @param {File|null} selectedVoice - Optional voice recording
   */
  const handleSend = useCallback(async (input, selectedImage, selectedVoice) => {
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

      // Get previous messages according to memory settings, filtering out the temp loading message
      const previousMessages = preparePreviousMessages([...messages, userMessage])
        .filter(msg => msg.id !== tempLoadingId);

      // Send message to the API service with conversation history
      const data = await sendMessage(originalInput, originalImage, originalVoice, previousMessages);
      
      // Update token usage statistics
      if (data.tokenUsage && updateTokenUsage) {
        updateTokenUsage(data.tokenUsage);
      }
      
      // Replace the loading message with the actual AI response and update user message with prompt tokens
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== tempLoadingId);
        
        // Update the user message with prompt token count
        const updatedMessages = filtered.map(msg => 
          msg.id === userMessageId && data.tokenUsage
            ? { 
                ...msg, 
                promptTokens: data.tokenUsage.promptTokens
              } 
            : msg
        );
        
        // Add the AI response
        return [...updatedMessages, {
          id: Date.now() + 2,
          text: data.message,
          sender: 'ai',
          timestamp: data.timestamp,
          tokenUsage: data.tokenUsage
        }];
      });
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Mark the user message as failed
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
    }
  }, [isLoading, messages, preparePreviousMessages, updateTokenUsage]);

  /**
   * Retry a failed message
   * @param {string} failedMessageId - ID of the failed message
   * @param {string} originalInput - Original message text
   * @param {File|null} originalImage - Original image file
   * @param {File|null} originalVoice - Original voice recording
   */
  const handleRetry = useCallback(async (failedMessageId, originalInput, originalImage, originalVoice) => {
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
      const currentMessages = messages.map(msg => 
        msg.id === failedMessageId 
          ? { ...msg, isRetrying: true, hasError: false, error: null }
          : msg
      );
      const previousMessages = preparePreviousMessages(currentMessages);

      // Send message to the API service with conversation history
      const data = await sendMessage(originalInput, originalImage, originalVoice, previousMessages);
      
      // Update token usage statistics
      if (data.tokenUsage && updateTokenUsage) {
        updateTokenUsage(data.tokenUsage);
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
  }, [isLoading, messages, preparePreviousMessages, updateTokenUsage]);

  /**
   * Clear all messages
   */
  const handleClearChat = useCallback(() => {
    setMessages([]);
    setError('');
  }, []);

  return {
    messages,
    setMessages,
    isLoading: isLoading || isInitializing,
    isInitializing,
    error,
    setError,
    handleSend,
    handleRetry,
    handleClearChat
  };
};