import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Custom hook to manage scroll behavior in chat interfaces
 * 
 * @param {Object} options - Configuration options
 * @param {Array} options.messages - The array of messages
 * @param {boolean} options.isWaitingForAIResponse - Whether we're waiting for an AI response
 * @returns {Object} - Scroll-related state and functions
 */
export const useScrollToBottom = ({ messages }) => {
  // Refs for DOM elements
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  
  // State for auto-scrolling behavior
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const [isWaitingForAIResponse, setIsWaitingForAIResponse] = useState(false);
  
  // Refs to track message state changes
  const lastMessageCountRef = useRef(0);
  const userInteractedRef = useRef(false);
  const lastMessageSenderRef = useRef(null);
  const isUserSendingRef = useRef(false);
  const isAIRespondingRef = useRef(false);
  
  // Track message state changes
  useEffect(() => {
    if (messages.length === 0) return;
    
    const lastMessage = messages[messages.length - 1];
    const isUserMessage = lastMessage.sender === 'user';
    const isAILoading = lastMessage.sender === 'ai' && lastMessage.isLoading;
    const isAIResponse = lastMessage.sender === 'ai' && !lastMessage.isLoading;
    
    // Detect when a user sends a message
    if (isUserMessage && lastMessageSenderRef.current !== 'user') {
      isUserSendingRef.current = true;
      setTimeout(() => {
        isUserSendingRef.current = false;
      }, 500); // Reset after a delay
    }
    
    // Detect when AI starts responding (loading message appears)
    if (isAILoading) {
      setIsWaitingForAIResponse(true);
      isAIRespondingRef.current = true;
    }
    
    // Detect when AI response is complete
    if (isAIResponse && isAIRespondingRef.current) {
      setIsWaitingForAIResponse(false);
      isAIRespondingRef.current = false;
      
      // Force scroll when AI finishes responding, unless user interacted
      if (!userInteractedRef.current) {
        setTimeout(() => {
          scrollToBottom({ force: true, smooth: true });
        }, 100);
      }
    }
    
    // Update last message sender reference
    lastMessageSenderRef.current = lastMessage.sender;
  }, [messages]);

  // More intelligent auto-scroll mechanism
  const scrollToBottom = useCallback((options = {}) => {
    const { force = false, smooth = true } = options;
    
    // Don't scroll if user has manually scrolled up, unless forced
    if (!autoScrollEnabled && !force) return;
    
    // If user has interacted during an AI response, don't auto-scroll
    if (userInteractedRef.current && isWaitingForAIResponse && !force) return;
    
    // Use smooth scrolling for better visual experience
    const behavior = smooth ? 'smooth' : 'auto';
    
    // Scroll to our end marker
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
    }
  }, [autoScrollEnabled, isWaitingForAIResponse]);

  // Effect to handle scrolling when new messages arrive
  useEffect(() => {
    if (messages.length > lastMessageCountRef.current) {
      // New messages have arrived
      lastMessageCountRef.current = messages.length;
      
      // Delay scrolling slightly to ensure render is complete
      setTimeout(scrollToBottom, 100);
      
      // Try again after a longer delay as a fallback
      setTimeout(scrollToBottom, 300);
    }
  }, [messages.length, scrollToBottom]);
  
  // Additional fallback for dynamic content that might change height
  useEffect(() => {
    // Set a few timeouts at different intervals for better reliability
    const timeouts = [
      setTimeout(scrollToBottom, 500),
      setTimeout(scrollToBottom, 1000),
      setTimeout(scrollToBottom, 2000)
    ];
    
    return () => {
      // Clean up all timeouts
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [messages.length, scrollToBottom]);

  // Auto-disable scroll on user scroll-up
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    
    const handleScroll = () => {
      const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      setAutoScrollEnabled(isAtBottom);
    };
    
    container.addEventListener('scroll', handleScroll);
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Make scrolling more reliable by increasing scroll buffer
  useEffect(() => {
    if (messages.length > 0) {
      // Force scroll to bottom with a small delay to ensure rendering is complete
      const scrollWithBuffer = () => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight + 100;
        }
        
        // Scroll to our positioned end marker
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ block: 'end' });
        }
      };
      
      // Apply multiple scrolls with different timings for reliability
      scrollWithBuffer();
      setTimeout(scrollWithBuffer, 100);
      setTimeout(scrollWithBuffer, 300);
      setTimeout(scrollWithBuffer, 500);
    }
  }, [messages.length]);

  // Detect user interactions while waiting for AI
  useEffect(() => {
    const handleUserInteraction = () => {
      if (isWaitingForAIResponse) {
        userInteractedRef.current = true;
      }
    };
    
    // Track mouse and keyboard events to detect user interaction
    window.addEventListener('mousedown', handleUserInteraction);
    window.addEventListener('keydown', handleUserInteraction);
    
    return () => {
      window.removeEventListener('mousedown', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
    };
  }, [isWaitingForAIResponse]);

  // Listen for user input activity to improve scroll behavior
  useEffect(() => {
    const handleUserInputActivity = (event) => {
      if (event.detail?.isActive) {
        // Reset user interaction when user is actively typing
        userInteractedRef.current = false;
        
        // Auto-scroll to the bottom when user is typing
        if (!isUserSendingRef.current) {
          requestAnimationFrame(() => {
            scrollToBottom({ smooth: true });
          });
        }
      }
    };
    
    // Listen for the custom event from MessageInput
    window.addEventListener('user-input-activity', handleUserInputActivity);
    
    return () => {
      window.removeEventListener('user-input-activity', handleUserInputActivity);
    };
  }, [scrollToBottom]);

  return {
    messagesEndRef,
    messagesContainerRef,
    isWaitingForAIResponse,
    scrollToBottom,
    autoScrollEnabled
  };
};