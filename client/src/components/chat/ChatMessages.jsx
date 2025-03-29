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
import AudioPlayer from '../audio/AudioPlayer';
import { ErrorDisplay } from '../ErrorDisplay';
import { ChatActionBar } from './ChatActionBar';

// Message component to represent a single message
const ChatMessage = ({
  message,
  isRetrying,
  onRetry,
  isLastMessage
}) => {
  const styles = useStyles();
  const isError = message.hasError && !isRetrying;
  const isUser = message.sender === 'user';
  
  // Format timestamp for tooltip
  const formattedTime = new Date(message.timestamp).toLocaleTimeString();
  
  // Format numbers with commas for token displays
  const formatNumber = (num) => {
    if (!num && num !== 0) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  // Helper to categorize error types
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
  
  // Helper function to render token usage for an AI message
  const renderTokenUsage = () => {
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
  
  // Helper function to render prompt tokens for a user message
  const renderPromptTokens = () => {
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
  
  // For messages with errors, use a different container structure
  if (isError) {
    return (
      <div className={styles.messageRow}>
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
              onClick={(e) => onRetry(
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
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      // Preserve whitespace in code blocks
                      code: ({node, inline, className, children, ...props}) => {
                        return inline ? (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        ) : (
                          <pre className={className}>
                            <code {...props}>{children}</code>
                          </pre>
                        )
                      },
                      // Add proper spacing for paragraphs
                      p: ({node, children, ...props}) => (
                        <p style={{whiteSpace: 'pre-wrap'}} {...props}>{children}</p>
                      ),
                      // Maintain indentation in lists
                      li: ({node, children, ...props}) => (
                        <li style={{paddingLeft: '4px'}} {...props}>{children}</li>
                      )
                    }}
                  >
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
            <div className={`${styles.timestampTooltip} timestampTooltip`}>
              {formattedTime}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // For regular messages without errors, use the standard layout
  return (
    <div 
      className={styles.messageRow}
      data-is-last-message={isLastMessage ? 'true' : 'false'}
      data-sender={isUser ? 'user' : 'ai'}
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
        ) : isRetrying ? (
          <div className={styles.messageContent}>
            {message.text && (
              <div className={styles.markdown}>
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // Preserve whitespace in code blocks
                    code: ({node, inline, className, children, ...props}) => {
                      return inline ? (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      ) : (
                        <pre className={className}>
                          <code {...props}>{children}</code>
                        </pre>
                      )
                    },
                    // Add proper spacing for paragraphs
                    p: ({node, children, ...props}) => (
                      <p style={{whiteSpace: 'pre-wrap'}} {...props}>{children}</p>
                    ),
                    // Maintain indentation in lists
                    li: ({node, children, ...props}) => (
                      <li style={{paddingLeft: '4px'}} {...props}>{children}</li>
                    )
                  }}
                >
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
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // Preserve whitespace in code blocks
                    code: ({node, inline, className, children, ...props}) => {
                      return inline ? (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      ) : (
                        <pre className={className}>
                          <code {...props}>{children}</code>
                        </pre>
                      )
                    },
                    // Add proper spacing for paragraphs
                    p: ({node, children, ...props}) => (
                      <p style={{whiteSpace: 'pre-wrap'}} {...props}>{children}</p>
                    ),
                    // Maintain indentation in lists
                    li: ({node, children, ...props}) => (
                      <li style={{paddingLeft: '4px'}} {...props}>{children}</li>
                    )
                  }}
                >
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
            {!isUser && message.tokenUsage && renderTokenUsage()}
            {isUser && message.promptTokens && renderPromptTokens()}
          </div>
        )}
        <div className={`${styles.timestampTooltip} timestampTooltip`}>
          {formattedTime}
        </div>
      </div>
    </div>
  );
};

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
    overflow: 'auto', // Changed from hidden to auto for standard scrolling
    padding: '12px',
    ...shorthands.gap('6px'),
  },
  messagesContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    flexGrow: 1,
    ...shorthands.gap('16px'), // Consistent gap between all messages
    paddingBottom: '20px', // Extra padding at bottom for better visibility
  },
  messageRow: {
    display: 'flex',
    width: '100%',
    padding: '4px 0',
    position: 'relative',
    // User messages are aligned to the right
    '&[data-sender="user"]': {
      justifyContent: 'flex-end',
    },
    // AI messages are aligned to the left
    '&[data-sender="ai"]': {
      justifyContent: 'flex-start',
    },
    // Extra space for last message
    '&[data-is-last-message="true"]': {
      marginBottom: '20px',
    },
  },
  messageContainer: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '80%',
    padding: '6px 8px',
    borderRadius: '8px',
    ...shorthands.gap('3px'),
    position: 'relative',
  },
  messageContent: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('4px'),
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
  userMessage: {
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
  },
  aiMessage: {
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
      margin: '0 0 12px 0', // Add bottom margin to paragraphs for better spacing
      whiteSpace: 'pre-wrap', // Preserve whitespace including line breaks
    },
    '& p:last-child': {
      marginBottom: 0, // Remove margin from last paragraph to avoid extra space
    },
    '& pre': {
      backgroundColor: tokens.colorNeutralBackground4,
      padding: '10px', // Increased padding
      borderRadius: '4px',
      overflowX: 'auto',
      whiteSpace: 'pre', // Preserve all whitespace in code blocks
      margin: '8px 0', // Add vertical margin
    },
    '& code': {
      backgroundColor: tokens.colorNeutralBackground4,
      padding: '1px 3px',
      borderRadius: '3px',
      fontFamily: 'monospace',
      whiteSpace: 'pre', // Preserve whitespace in inline code
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
      margin: '8px 0', // Add vertical margin
    },
    '& table': {
      borderCollapse: 'collapse',
      width: '100%',
      margin: '10px 0', // Increased margin
    },
    '& th, & td': {
      border: `1px solid ${tokens.colorNeutralStroke1}`,
      padding: '8px', // Increased padding
      textAlign: 'left',
    },
    '& blockquote': {
      borderLeft: `4px solid ${tokens.colorBrandStroke1}`,
      margin: '10px 0', // Added vertical margin
      paddingLeft: '12px', // Increased padding
      color: tokens.colorNeutralForeground2,
    },
    // Improved styling for lists
    '& ul, & ol': {
      paddingLeft: '24px', // Increased from 16px
      marginTop: '8px', // Increased from 2px
      marginBottom: '8px', // Increased from 2px
      boxSizing: 'border-box',
      width: '100%',
    },
    '& li': {
      marginBottom: '6px', // Increased from 2px for better list item spacing
      paddingLeft: '4px', // Add left padding for list items
      // Ensure text wraps properly
      overflowWrap: 'break-word',
      wordWrap: 'break-word',
      wordBreak: 'break-word',
    },
    '& li:last-child': {
      marginBottom: '2px', // Less margin on last item
    },
    // Ensure all content wraps properly
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
    width: '100%',
    // Add spacing between block elements
    '& > *:not(:last-child)': {
      marginBottom: '8px',
    },
  },
  timestampTooltip: {
    position: 'absolute',
    bottom: '-24px',
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
    top: '50%',
    transform: 'translateY(-50%)',
  },
  senderLabelUser: {
    left: '-40px',
  },
  senderLabelAi: {
    right: '-30px',
  },
  messageContainerWithHover: {
    '&:hover .timestampTooltip, &:hover .senderLabel': {
      opacity: 1,
    },
    marginBottom: '8px',
    marginTop: '4px',
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
    maxWidth: '300px',
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
    color: tokens.colorNeutralForegroundOnBrand,
  },
  tokenIcon: {
    fontSize: '10px',
    color: tokens.colorNeutralForeground3,
  },
  tokenIconUser: {
    fontSize: '10px',
    color: tokens.colorNeutralForegroundOnBrand,
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
    if (!message) return 80;

    // More accurate height calculation
    const baseHeight = 60; 
    const textLength = message.text?.length || 0;
    // More accurate text height calculation based on character count
    const textHeight = Math.max(18, Math.min(Math.ceil(textLength / 50) * 18, 300));
    const hasImage = message.image ? 300 : 0;
    const hasVoice = message.voice ? 100 : 0;
    const hasError = message.hasError ? 60 : 0;
    
    // Add extra spacing buffer to prevent overlap
    const spacingBuffer = 30;
    
    // Handle scrolling boundary cases by examining adjacent messages
    const isPreviousAI = index > 0 && messages[index - 1]?.sender === 'ai';
    const isNextAI = index < messages.length - 1 && messages[index + 1]?.sender === 'ai';
    const isUser = message.sender === 'user';
    
    // Special boundary adjustments to prevent overlapping bubbles
    let boundaryAdjustment = 0;
    if (isUser && isPreviousAI) boundaryAdjustment -= 5;
    if (!isUser && index > 0 && messages[index - 1]?.sender === 'user') boundaryAdjustment += 5;
    
    // Calculate total height and cache it
    const totalHeight = baseHeight + textHeight + hasImage + hasVoice + hasError + spacingBuffer + boundaryAdjustment;
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
  
  // Custom row renderer for virtualized list
  const MessageRow = ({ index, style }) => {
    const message = messages[index];
    const isLastMessage = index === messages.length - 1;
    const isRetrying = retryingIds.has(message.id);
    
    // Apply consistent spacing - modify style to ensure consistent gaps
    // Important: top position must be respected but height needs extra space to prevent overlap
    const modifiedStyle = {
      ...style,
      height: style.height + 25, // Add extra height buffer to prevent overlap
      paddingBottom: isLastMessage ? '20px' : '0',
      paddingTop: '10px', // Ensure consistent top padding
    };

    return (
      <div style={modifiedStyle}>
        <ChatMessage 
          message={message} 
          isRetrying={isRetrying} 
          onRetry={onRetryMessage} 
          isLastMessage={isLastMessage} 
        />
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

  return (
    <div className={styles.chatWrapper}>
      <div className={styles.chatContainer}>
        {isInitializing ? (
          <ChatSkeleton />
        ) : messages.length === 0 ? (
          <EmptyMessage />
        ) : (
          <div className={styles.messagesContainer}>
            {messages.map((message, index) => (
              <ChatMessage 
                key={message.id || index} 
                message={message} 
                isRetrying={retryingIds.has(message.id)} 
                onRetry={onRetryMessage} 
                isLastMessage={index === messages.length - 1} 
              />
            ))}
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
          </div>
        )}
        
        {error && <ErrorDisplay message={error} type="error" onDismiss={() => setError('')} />}
      </div>
      
      {/* Add the action bar with clear chat button */}
      <ChatActionBar onClearChat={useChat().handleClearChat} isConfigured={useChat().isConfigured} />
    </div>
  );
};