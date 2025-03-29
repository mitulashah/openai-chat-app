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
    padding: '20px',
    ...shorthands.gap('10px'),
  },
  messageContainer: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '80%',
    padding: '10px',
    borderRadius: '8px',
    ...shorthands.gap('5px'),
    position: 'relative',
  },
  messageContent: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('8px'),
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
      padding: '8px',
      borderRadius: '4px',
      overflowX: 'auto',
    },
    '& code': {
      backgroundColor: tokens.colorNeutralBackground4,
      padding: '2px 4px',
      borderRadius: '4px',
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
      margin: '10px 0',
    },
    '& th, & td': {
      border: `1px solid ${tokens.colorNeutralStroke1}`,
      padding: '8px',
      textAlign: 'left',
    },
    '& blockquote': {
      borderLeft: `4px solid ${tokens.colorBrandStroke1}`,
      margin: '0',
      paddingLeft: '10px',
      color: tokens.colorNeutralForeground2,
    },
    // Add proper styling for lists
    '& ul, & ol': {
      paddingLeft: '20px',  // Reduce default padding
      marginTop: '4px',
      marginBottom: '4px',
      boxSizing: 'border-box',
      width: '100%',
    },
    '& li': {
      marginBottom: '4px',
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
    bottom: '-25px',
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
  timestampTooltipUser: {
    right: '5px',
  },
  timestampTooltipAi: {
    left: '5px',
  },
  messageContainerWithHover: {
    '&:hover .timestampTooltip': {
      opacity: 1,
    },
    marginBottom: '15px', // Add space between messages to accommodate the tooltip
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
  const { handleRetry } = useChat();
  const [retryingIds, setRetryingIds] = useState(new Set());
  const [isScrolling, setIsScrolling] = useState(false);

  // Calculate and cache message heights for virtualized list
  const getMessageHeight = useCallback((index) => {
    // Use cached height if available
    if (sizeCache.current[index] !== undefined) {
      return sizeCache.current[index];
    }

    const message = messages[index];
    if (!message) return 100; // Default height

    // Estimate height based on content
    const baseHeight = 80;
    const textLength = message.text?.length || 0;
    const hasImage = message.image ? 300 : 0;
    const hasVoice = message.voice ? 100 : 0;
    const hasError = message.hasError ? 40 : 0;
    
    // Estimate text height (about 20px per 100 chars)
    const textHeight = Math.max(20, Math.ceil(textLength / 50) * 20);
    
    // Calculate total height and cache it
    const totalHeight = baseHeight + textHeight + hasImage + hasVoice + hasError;
    sizeCache.current[index] = totalHeight;
    
    return totalHeight;
  }, [messages]);

  // Reset size cache when messages change
  useEffect(() => {
    sizeCache.current = {};
  }, [messages.length]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (listRef.current && messages.length > 0) {
      listRef.current.scrollToItem(messages.length - 1);
    }
  }, [messages.length]);
  
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

    // For messages with errors, use a different container structure
    if (isError) {
      return (
        <div 
          style={{
            ...style,
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
          ...style,
          display: 'flex',
          justifyContent: isUser ? 'flex-end' : 'flex-start',
          paddingRight: isUser ? '20px' : '0',
          paddingLeft: isUser ? '0' : '20px'
        }}
      >
        <div
          className={`
            ${styles.messageContainer} 
            ${isUser ? styles.userMessage : styles.aiMessage}
            ${styles.messageContainerWithHover}
          `}
        >
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

  return (
    <div className={styles.chatWrapper}>
      <div className={styles.chatContainer}>
        {isInitializing ? (
          <ChatSkeleton />
        ) : messages.length === 0 ? (
          <EmptyMessage />
        ) : (
          <AutoSizer>
            {({ height, width }) => (
              <List
                ref={listRef}
                height={height}
                width={width}
                itemCount={messages.length}
                itemSize={getMessageHeight}
                overscanCount={5}
                onScroll={() => setIsScrolling(true)}
                onScrollEnd={() => setIsScrolling(false)}
              >
                {MessageRow}
              </List>
            )}
          </AutoSizer>
        )}
        
        {error && <ErrorDisplay message={error} type="error" onDismiss={() => setError('')} />}
        
        {/* Add a blank div for scrolling to the bottom */}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Add the action bar with clear chat button */}
      <ChatActionBar onClearChat={useChat().handleClearChat} isConfigured={useChat().isConfigured} />
    </div>
  );
};