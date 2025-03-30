import { useState, useEffect } from 'react';

/**
 * Custom hook to track message state changes in a chat interface
 * 
 * @param {Object} options - Configuration options
 * @param {Array} options.messages - The array of messages to track
 * @returns {Object} - Message state tracking information
 */
export const useMessageStateTracking = ({ messages }) => {
  // State for tracking message states
  const [isWaitingForAIResponse, setIsWaitingForAIResponse] = useState(false);
  const [retryingIds, setRetryingIds] = useState(new Set());
  
  // Track AI message loading state changes
  useEffect(() => {
    if (messages.length === 0) return;
    
    // Check if the last message is from the AI and is in loading state
    const lastMessage = messages[messages.length - 1];
    const isAILoading = lastMessage && lastMessage.sender === 'ai' && lastMessage.isLoading;
    
    // Update the waiting state
    setIsWaitingForAIResponse(isAILoading);
  }, [messages]);

  // Helper function for retry message handling with better state management
  const handleRetryMessage = (e, failedMessageId, originalInput, originalImage, originalVoice, retryHandler) => {
    // Prevent default browser behavior that might cause page refresh
    e.preventDefault();
    e.stopPropagation();
    
    // Set local state to prevent UI flickering
    setRetryingIds(prev => new Set(prev).add(failedMessageId));
    
    // Call the actual retry function
    return retryHandler(failedMessageId, originalInput, originalImage, originalVoice)
      .finally(() => {
        // Clean up local state when done
        setRetryingIds(prev => {
          const next = new Set(prev);
          next.delete(failedMessageId);
          return next;
        });
      });
  };

  return {
    isWaitingForAIResponse,
    retryingIds,
    handleRetryMessage
  };
};