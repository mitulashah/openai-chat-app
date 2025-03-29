import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Text,
  makeStyles,
  shorthands,
  tokens,
  Spinner,
  Button,
  Badge,
  Tooltip,
} from '@fluentui/react-components';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  ErrorCircleRegular,
  ArrowResetRegular,
  DataUsageRegular
} from '@fluentui/react-icons';
import { useChat } from '../../contexts/ChatContext';
import { VariableSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import AudioPlayer from '../audio/AudioPlayer';
import { ErrorDisplay } from '../ErrorDisplay';
import { ChatActionBar } from './ChatActionBar';

const useStyles = makeStyles({
  // Add wrapper for container to hold both messages and action bar
  chatWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    overflow: 'hidden',
  },
  chatContainer: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    overflow: 'hidden',
    padding: '12px', // Reduced from 20px
    ...shorthands.gap('6px'), // Reduced from 10px
  },
  messageContainer: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '80%',
    padding: '6px 8px', // Reduced from 10px
    borderRadius: '8px',
    ...shorthands.gap('3px'), // Reduced from 5px
    position: 'relative',
  },
  messageContent: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('4px'), // Reduced from 8px
  },
  messageImage: {
    maxWidth: '100%',
    maxHeight: '300px',
    borderRadius: '4px',
    objectFit: 'contain',
  },
  messageAudio: {
    maxWidth: '100%',
  },
  // Audio-related styles removed as they're now in AudioPlayer component
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: tokens.colorNeutralBackground3,
  },
  error: {
    color: tokens.colorPaletteRedForeground1,
    padding: '10px',
    textAlign: 'center',
  },
  errorMessageContainer: {
    borderColor: 'transparent',
    borderWidth: '0',
    borderStyle: 'none',
    boxShadow: 'none',
  },
  errorIndicator: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('6px'),
    color: '#FF5555', // Dracula theme red color
    backgroundColor: 'transparent',
    padding: '4px 0',
    fontSize: '12px',
    marginTop: '4px',
  },
  errorRetry: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '6px',
  },
  errorMessage: {
    flex: 1,
    fontSize: '12px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  loadingMessage: {
    alignSelf: 'flex-start',
    backgroundColor: tokens.colorNeutralBackground2,
    padding: '15px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '60px',
  },
  retryingIndicator: {
    backgroundColor: tokens.colorNeutralBackground4,
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('4px'),
    opacity: 0.7,
  },
  markdown: {
    '& p': {
      margin: 0,
    },
    '& pre': {
      backgroundColor: tokens.colorNeutralBackground4,
      padding: '6px', // Reduced from 8px
      borderRadius: '4px',
      overflowX: 'auto',
    },
    '& code': {
      backgroundColor: tokens.colorNeutralBackground4,
      padding: '1px 3px', // Reduced from 2px 4px
      borderRadius: '3px',
      fontFamily: 'monospace',
    },
    '& a': {
      color: tokens.colorBrandForeground1,
      textDecoration: 'none',
      '&:hover': {
        textDecoration: 'underline',
      },
    },
    '& img': {
      maxWidth: '100%',
    },
    '& table': {
      borderCollapse: 'collapse',
      width: '100%',
      margin: '6px 0', // Reduced from 10px
    },
    '& th, & td': {
      border: `1px solid ${tokens.colorNeutralStroke1}`,
      padding: '6px', // Reduced from 8px
      textAlign: 'left',
    },
    '& blockquote': {
      borderLeft: `4px solid ${tokens.colorBrandStroke1}`,
      margin: '0',
      paddingLeft: '8px', // Reduced from 10px
      color: tokens.colorNeutralForeground2,
    },
    // Add proper styling for lists
    '& ul, & ol': {
      paddingLeft: '16px',  // Reduced from 20px
      marginTop: '2px', // Reduced from 4px
      marginBottom: '2px', // Reduced from 4px
      boxSizing: 'border-box',
      width: '100%',
    },
    '& li': {
      marginBottom: '2px', // Reduced from 4px
      // Ensure text wraps properly
      overflowWrap: 'break-word',
      wordWrap: 'break-word',
      wordBreak: 'break-word',
    },
    // Ensure all content wraps properly
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
    width: '100%',
  },
  timestampTooltip: {
    position: 'absolute',
    bottom: '-24px', // Moved further down to fully clear the bubble
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
    opacity: 0,
    transition: 'opacity 0.2s ease',
    pointerEvents: 'none',
    backgroundColor: tokens.colorNeutralBackground1,
    padding: '2px 6px',
    borderRadius: '4px',
    zIndex: 10,
    whiteSpace: 'nowrap',
    boxShadow: `0 2px 4px rgba(0, 0, 0, 0.1)`,
  },
  // Repositioned sender labels to appear on the sides instead of above
  senderLabel: {
    position: 'absolute',
    fontSize: '11px',
    fontWeight: '600',
    color: tokens.colorNeutralForeground3,
    opacity: 0,
    transition: 'opacity 0.2s ease',
    pointerEvents: 'none',
    backgroundColor: tokens.colorNeutralBackground1,
    padding: '2px 6px',
    borderRadius: '4px',
    zIndex: 10,
    whiteSpace: 'nowrap',
    boxShadow: `0 2px 4px rgba(0, 0, 0, 0.1)`,
    top: '50%', // Center vertically
    transform: 'translateY(-50%)', // Center vertically
  },
  senderLabelUser: {
    left: '-40px', // Position to the left of user messages
  },
  senderLabelAi: {
    right: '-30px', // Position to the right of AI messages
  },
  messageContainerWithHover: {
    '&:hover .timestampTooltip, &:hover .senderLabel': {
      opacity: 1,
    },
    marginBottom: '8px', // Reduced from 12px
    marginTop: '4px', // Reduced from 5px
  },
  // New styles for left-positioned error display
  messageWithErrorContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    ...shorthands.gap('10px'),
    width: '100%',
    justifyContent: 'flex-end',
  },
  messageWithErrorContainerAi: {
    justifyContent: 'flex-start',
  },
  errorIndicatorLeft: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    ...shorthands.gap('6px'),
    color: '#FF5555', // Dracula theme red color
    backgroundColor: 'transparent',
    padding: '4px 8px',
    fontSize: '12px',
    maxWidth: '300px', // Changed from 150px to 300px for more error text space
  },
  errorIndicatorLeftAi: {
    justifyContent: 'flex-start',
  },
  tokenInfo: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('4px'),
    marginTop: '4px',
    justifyContent: 'flex-end',
  },
  tokenText: {
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
  },
  tokenTextUser: {
    fontSize: '11px',
    color: tokens.colorNeutralForegroundOnBrand, // Use the same color as user message text
  },
  tokenIcon: {
    fontSize: '10px',
    color: tokens.colorNeutralForeground3,
  },
  tokenIconUser: {
    fontSize: '10px',
    color: tokens.colorNeutralForegroundOnBrand, // Use the same color as user message text
  },
  tokenBadge: {
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
    fontSize: '10px',
    height: '16px',
    padding: '2px 6px',
  },
  tokenTooltipContent: {
    padding: '6px',
    maxWidth: '200px',
  },
  tokenStatsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    ...shorthands.gap('12px'),
    marginBottom: '4px',
    fontSize: '12px',
  },
  // Skeleton UI styles
  skeletonContainer: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('20px'),
    padding: '20px',
    width: '100%',
  },
  skeletonMessage: {
    padding: '15px',
    borderRadius: '8px',
    maxWidth: '70%',
  },
  skeletonUser: {
    alignSelf: 'flex-end',
    backgroundColor: `${tokens.colorBrandBackground}40`,
  },
  skeletonAi: {
    alignSelf: 'flex-start',
    backgroundColor: `${tokens.colorNeutralBackground3}80`,
  },
  skeletonContent: {
    height: '40px',
    width: '100%',
    borderRadius: '4px',
    animation: {
      '0%': {
        opacity: 0.6,
      },
      '50%': {
        opacity: 0.3,
      },
      '100%': {
        opacity: 0.6,
      }
    },
    animationDuration: '1.5s',
    animationIterationCount: 'infinite',
  },
  skeletonLoading: {
    alignSelf: 'center',
    padding: '10px',
  },
  // Empty state styles
  emptyStateContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    pointerEvents: 'none',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    color: tokens.colorNeutralForeground3,
    textAlign: 'center',
  },
});

export const ChatMessages = ({ messages, error, isLoading, isInitializing }) => {
  const styles = useStyles();
  const messagesEndRef = useRef(null);
  const listRef = useRef(null);
  const sizeCache = useRef({});
  const { handleRetry, setError } = useChat();
  const [retryingIds, setRetryingIds] = useState(new Set());
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const lastMessageCountRef = useRef(0);
  // Track whether we're waiting for an AI response
  const [isWaitingForAIResponse, setIsWaitingForAIResponse] = useState(false);
  const userInteractedRef = useRef(false);

  // More intelligent auto-scroll mechanism to prevent flashing
  const scrollToBottom = useCallback((options = {}) => {
    const { force = false, smooth = true } = options;
    
    // Don't scroll if user has manually scrolled up, unless forced
    if (!autoScrollEnabled && !force) return;
    
    // If user has interacted during an AI response, don't auto-scroll
    if (userInteractedRef.current && isWaitingForAIResponse && !force) return;
    
    // Use smooth scrolling for better visual experience
    const behavior = smooth ? 'smooth' : 'auto';
    
    // Primary approach - scroll to our end marker
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
    }

    // Backup approach with the virtualized list
    if (listRef.current) {
      try {
        // Scroll to the last item immediately with correct alignment
        listRef.current.scrollToItem(messages.length - 1, 'end');
        
        // Ensure we're fully scrolled to the bottom
        if (listRef.current._outerRef) {
          const listElement = listRef.current._outerRef;
          listElement.scrollTop = listElement.scrollHeight;
        }
      } catch (err) {
        console.log('Error scrolling list, using fallback');
      }
    }
  }, [messages.length, autoScrollEnabled, isWaitingForAIResponse]);

  // Effect to handle scrolling when new messages arrive
  useEffect(() => {
    if (messages.length > lastMessageCountRef.current) {
      // New messages have arrived
      lastMessageCountRef.current = messages.length;
      
      // Reset size cache when messages change
      sizeCache.current = {};
      
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
    if (!listRef.current || !listRef.current._outerRef) return;
    
    const handleScroll = () => {
      const list = listRef.current._outerRef;
      const isAtBottom = list.scrollHeight - list.scrollTop - list.clientHeight < 100;
      setAutoScrollEnabled(isAtBottom);
    };
    
    const listElement = listRef.current._outerRef;
    listElement.addEventListener('scroll', handleScroll);
    
    return () => {
      if (listElement) {
        listElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  // Calculate and cache message heights for virtualized list
  const getMessageHeight = useCallback((index) => {
    // Use cached height if available
    if (sizeCache.current[index] !== undefined) {
      return sizeCache.current[index];
    }

    const message = messages[index];
    if (!message) return 80; // Reduced default height from 100

    // More accurate height calculation
    const baseHeight = 60; 
    const textLength = message.text?.length || 0;
    // More accurate text height calculation based on character count
    const textHeight = Math.max(18, Math.min(Math.ceil(textLength / 50) * 18, 300));
    const hasImage = message.image ? 300 : 0;
    const hasVoice = message.voice ? 100 : 0;
    const hasError = message.hasError ? 60 : 0;
    
    // Fixed margins for consistent spacing - critical for preventing large gaps
    const padding = 20; // Reduced to prevent extra space
    
    // Handle scrolling boundary cases by examining adjacent messages
    const isPreviousAI = index > 0 && messages[index - 1]?.sender === 'ai';
    const isUser = message.sender === 'user';
    
    // Add padding adjustment for when a user message follows an AI message
    const boundaryAdjustment = (isUser && isPreviousAI) ? -10 : 0;
    
    // Calculate total height and cache it
    const totalHeight = baseHeight + textHeight + hasImage + hasVoice + hasError + padding + boundaryAdjustment;
    sizeCache.current[index] = totalHeight;
    
    return totalHeight;
  }, [messages]);

  // Helper function for retry with better state management
  const onRetryMessage = (e, failedMessageId, originalInput, originalImage, originalVoice) => {
    // Prevent default browser behavior that might cause page refresh
    e.preventDefault();
    e.stopPropagation();
    
    // Set local state to prevent UI flickering
    setRetryingIds(prev => new Set(prev).add(failedMessageId));
    
    // Call the actual retry function
    handleRetry(failedMessageId, originalInput, originalImage, originalVoice)
      .finally(() => {
        // Clean up local state when done
        setRetryingIds(prev => {
          const next = new Set(prev);
          next.delete(failedMessageId);
          return next;
        });
      });
  };
  
  // Helper function to categorize error types
  const getErrorMessage = (errorMsg) => {
    if (!errorMsg) return "An unknown error occurred";
    
    if (errorMsg.includes('network') || errorMsg.includes('fetch')) {
      return "Network error: Unable to reach the server";
    } else if (errorMsg.includes('429') || errorMsg.includes('rate limit') || errorMsg.includes('quota')) {
      return "Rate limit exceeded: Try again later";
    } else if (errorMsg.includes('content') || errorMsg.includes('policy')) {
      return "Content policy violation: Message couldn't be processed";
    } else {
      return errorMsg;
    }
  };

  // Format numbers with commas
  const formatNumber = (num) => {
    if (!num && num !== 0) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Helper function to render token usage for a message
  const renderTokenUsage = (message) => {
    if (!message.tokenUsage) return null;
    
    return (
      <div className={styles.tokenInfo}>
        <Tooltip
          content={
            <div className={styles.tokenTooltipContent}>
              <div className={styles.tokenStatsRow}>
                <Text>Prompt Tokens:</Text>
                <Text weight="semibold">{formatNumber(message.tokenUsage.promptTokens)}</Text>
              </div>
              <div className={styles.tokenStatsRow}>
                <Text>Completion Tokens:</Text>
                <Text weight="semibold">{formatNumber(message.tokenUsage.completionTokens)}</Text>
              </div>
              <div className={styles.tokenStatsRow}>
                <Text>Total Tokens:</Text>
                <Text weight="semibold">{formatNumber(message.tokenUsage.totalTokens)}</Text>
              </div>
            </div>
          }
          relationship="label"
          positioning="above"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <DataUsageRegular className={styles.tokenIcon} />
            <Text className={styles.tokenText}>
              {formatNumber(message.tokenUsage.completionTokens)} tokens
            </Text>
          </div>
        </Tooltip>
      </div>
    );
  };

  // Helper function to render prompt tokens for user messages
  const renderPromptTokens = (message) => {
    if (!message.promptTokens) return null;
    
    return (
      <div className={styles.tokenInfo}>
        <Tooltip
          content={
            <div className={styles.tokenTooltipContent}>
              <div className={styles.tokenStatsRow}>
                <Text>Prompt Tokens:</Text>
                <Text weight="semibold">{formatNumber(message.promptTokens)}</Text>
              </div>
            </div>
          }
          relationship="label"
          positioning="above"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <DataUsageRegular className={styles.tokenIconUser} />
            <Text className={styles.tokenTextUser}>
              {formatNumber(message.promptTokens)} tokens
            </Text>
          </div>
        </Tooltip>
      </div>
    );
  };

  // Custom row renderer for virtualized list
  const MessageRow = ({ index, style }) => {
    const message = messages[index];
    const isError = message.hasError && !retryingIds.has(message.id);
    const isUser = message.sender === 'user';
    const isLastMessage = index === messages.length - 1;
    
    // Apply consistent spacing - modify style to ensure consistent gaps
    const modifiedStyle = {
      ...style,
      // Add extra padding to the bottom of the last message to ensure it's not cut off
      paddingBottom: isLastMessage ? '20px' : '0',
      // Apply fixed margin for consistent spacing regardless of message position
      marginTop: '4px',
      marginBottom: '6px',
    };

    // For messages with errors, use a different container structure
    if (isError) {
      return (
        <div 
          style={{
            ...modifiedStyle,
            display: 'flex',
            justifyContent: isUser ? 'flex-end' : 'flex-start',
          }}
        >
          <div className={`
            ${styles.messageWithErrorContainer} 
            ${!isUser ? styles.messageWithErrorContainerAi : ''}
          `}>
            {/* Error indicator positioned to the left */}
            <div className={`
              ${styles.errorIndicatorLeft} 
              ${!isUser ? styles.errorIndicatorLeftAi : ''}
            `}>
              <ErrorCircleRegular />
              <Text className={styles.errorMessage}>
                {getErrorMessage(message.error)}
              </Text>
              <Button 
                icon={<ArrowResetRegular />}
                appearance="subtle"
                size="small"
                onClick={(e) => onRetryMessage(
                  e,
                  message.id, 
                  message.originalInput,
                  message.originalImage,
                  message.originalVoice
                )}
              >
                Retry
              </Button>
            </div>

            {/* Message bubble */}
            <div
              className={`
                ${styles.messageContainer} 
                ${isUser ? styles.userMessage : styles.aiMessage}
                ${styles.messageContainerWithHover}
              `}
            >
              <div className={styles.messageContent}>
                {message.text && (
                  <div className={styles.markdown}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.text}
                    </ReactMarkdown>
                  </div>
                )}
                {message.image && (
                  <img 
                    src={message.image} 
                    alt="Attached" 
                    className={styles.messageImage}
                  />
                )}
                {message.voice && (
                  <AudioPlayer 
                    src={message.voice} 
                    className={styles.messageAudio} 
                  />
                )}
              </div>
              <div className={`${styles.timestampTooltip} ${isUser ? styles.timestampTooltipUser : styles.timestampTooltipAi} timestampTooltip`}>
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // For regular messages without errors, use the standard layout
    return (
      <div
        style={{
          ...modifiedStyle,
          display: 'flex',
          justifyContent: isUser ? 'flex-end' : 'flex-start',
          paddingRight: isUser ? '10px' : '0', // Reduced from 20px
          paddingLeft: isUser ? '0' : '10px' // Reduced from 20px
        }}
      >
        <div
          className={`
            ${styles.messageContainer} 
            ${isUser ? styles.userMessage : styles.aiMessage}
            ${styles.messageContainerWithHover}
          `}
        >
          {/* Add sender label that appears on hover */}
          <div className={`
            ${styles.senderLabel} 
            ${isUser ? styles.senderLabelUser : styles.senderLabelAi}
            senderLabel
          `}>
            {isUser ? 'YOU' : 'AI'}
          </div>
          {message.isLoading ? (
            <div className={styles.messageContent}>
              <Spinner size="tiny" label="AI is thinking..." />
            </div>
          ) : message.isRetrying || retryingIds.has(message.id) ? (
            <div className={styles.messageContent}>
              {message.text && (
                <div className={styles.markdown}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.text}
                  </ReactMarkdown>
                </div>
              )}
              {message.image && (
                <img 
                  src={message.image} 
                  alt="Attached" 
                  className={styles.messageImage}
                />
              )}
              {message.voice && (
                <AudioPlayer 
                  src={message.voice} 
                  className={styles.messageAudio} 
                />
              )}
              <div className={styles.retryingIndicator}>
                <Spinner size="tiny" />
                <Text>Retrying message...</Text>
              </div>
            </div>
          ) : (
            <div className={styles.messageContent}>
              {message.text && (
                <div className={styles.markdown}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.text}
                  </ReactMarkdown>
                </div>
              )}
              {message.image && (
                <img 
                  src={message.image} 
                  alt="Attached" 
                  className={styles.messageImage}
                />
              )}
              {message.voice && (
                <AudioPlayer 
                  src={message.voice} 
                  className={styles.messageAudio} 
                />
              )}
              {!isUser && message.tokenUsage && renderTokenUsage(message)}
              {isUser && message.promptTokens && renderPromptTokens(message)}
            </div>
          )}
          <div className={`${styles.timestampTooltip} ${isUser ? styles.timestampTooltipUser : styles.timestampTooltipAi} timestampTooltip`}>
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>
    );
  };

  // Empty message placeholder for virtualized list
  const EmptyMessage = () => (
    <div className={styles.emptyStateContainer}>
      {messages.length === 0 && !isLoading ? (
        <div className={styles.emptyState}>
          <Text size={400}>Type a message to start chatting</Text>
        </div>
      ) : null}
    </div>
  );

  // Skeleton UI for loading state
  const ChatSkeleton = () => (
    <div className={styles.skeletonContainer}>
      <div className={`${styles.skeletonMessage} ${styles.skeletonUser}`}>
        <div className={styles.skeletonContent} />
      </div>
      <div className={styles.skeletonLoading}>
        <Spinner size="tiny" label="Loading conversation..." />
      </div>
      <div className={`${styles.skeletonMessage} ${styles.skeletonAi}`}>
        <div className={styles.skeletonContent} />
      </div>
      <div className={`${styles.skeletonMessage} ${styles.skeletonUser}`}>
        <div className={styles.skeletonContent} />
      </div>
    </div>
  );

  // Make scrolling more reliable by increasing scroll buffer
  useEffect(() => {
    if (messages.length > 0) {
      // For the last few messages, ensure they're always in view
      const scrollWithBuffer = () => {
        if (listRef.current) {
          // Ensure the list goes fully to the bottom with extra padding
          if (listRef.current._outerRef) {
            const listElement = listRef.current._outerRef;
            listElement.scrollTop = listElement.scrollHeight + 100; // Add extra buffer
          }
          
          // Always ensure last message is visible
          try {
            listRef.current.scrollToItem(messages.length - 1, 'end');
          } catch (err) {
            console.log('Error in scrollToItem, using fallback');
          }
          
          // Scroll to our positioned end marker
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ block: 'end' });
          }
        }
      };
      
      // Apply multiple scrolls with different timings for reliability
      scrollWithBuffer();
      setTimeout(scrollWithBuffer, 100);
      setTimeout(scrollWithBuffer, 300);
      setTimeout(scrollWithBuffer, 500);
    }
  }, [messages.length]);

  // Detect AI message loading state and user interactions
  useEffect(() => {
    // Check if the last message is from the AI and is in loading state
    const lastMessage = messages[messages.length - 1];
    const isAILoading = lastMessage && lastMessage.sender === 'ai' && lastMessage.isLoading;
    
    // Update the waiting state
    setIsWaitingForAIResponse(isAILoading);
    
    // When AI is done responding, reset user interaction flag and force scroll to bottom
    if (!isAILoading && isWaitingForAIResponse) {
      userInteractedRef.current = false;
      // Add small delay to ensure content is rendered
      setTimeout(() => {
        scrollToBottom({ force: true, smooth: true });
      }, 100);
    }
  }, [messages, scrollToBottom, isWaitingForAIResponse]);

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

  return (
    <div className={styles.chatWrapper}>
      <div className={styles.chatContainer}>
        {isInitializing ? (
          <ChatSkeleton />
        ) : messages.length === 0 ? (
          <EmptyMessage />
        ) : (
          <>
            <AutoSizer>
              {({ height, width }) => (
                <List
                  ref={listRef}
                  height={height}
                  width={width}
                  itemCount={messages.length}
                  itemSize={getMessageHeight}
                  overscanCount={20}
                  initialScrollOffset={999999}
                  itemData={messages}
                  style={{ 
                    paddingBottom: "70px", // Increased padding for better bottom visibility
                    boxSizing: "border-box"
                  }}
                  useIsScrolling={false}
                  direction="vertical"
                >
                  {MessageRow}
                </List>
              )}
            </AutoSizer>
            
            {/* This blank div is always placed at the end for smooth scrolling */}
            <div 
              ref={messagesEndRef} 
              style={{ 
                height: 1, 
                width: '100%', 
                clear: 'both',
                float: 'left' 
              }} 
            />
          </>
        )}
        
        {error && <ErrorDisplay message={error} type="error" onDismiss={() => setError('')} />}
      </div>
      
      {/* Add the action bar with clear chat button */}
      <ChatActionBar onClearChat={useChat().handleClearChat} isConfigured={useChat().isConfigured} />
    </div>
  );
};