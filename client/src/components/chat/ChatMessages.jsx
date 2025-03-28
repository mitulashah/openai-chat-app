import React, { useRef, useEffect, useState } from 'react';
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
  PlayRegular, 
  PauseRegular, 
  InfoRegular, 
  ErrorCircleRegular,
  ArrowResetRegular,
  DataUsageRegular
} from '@fluentui/react-icons';
import { useChat } from '../../contexts/ChatContext';

const useStyles = makeStyles({
  chatContainer: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    overflowY: 'auto',
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
  audioContainer: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('8px'),
    padding: '8px',
    backgroundColor: tokens.colorNeutralBackground4,
    borderRadius: '4px',
    marginTop: '4px',
  },
  audioControls: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('8px'),
  },
  audioProgress: {
    flexGrow: 1,
    height: '4px',
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: '2px',
    position: 'relative',
    cursor: 'pointer',
  },
  audioProgressFill: {
    height: '100%',
    backgroundColor: tokens.colorBrandBackground,
    borderRadius: '2px',
    position: 'absolute',
    left: 0,
    top: 0,
  },
  audioTime: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground2,
    whiteSpace: 'nowrap',
  },
  audioError: {
    color: tokens.colorStatusDangerForeground1,
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('4px'),
    fontSize: '12px',
  },
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
  tokenIcon: {
    fontSize: '10px',
    color: tokens.colorNeutralForeground3,
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
});

// Custom audio player component is being used but needs to be referenced correctly
const AudioPlayer = ({ src, className }) => {
  const styles = useStyles();
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      audio.currentTime = 0;
    };

    const handleError = (e) => {
      setError('Failed to load audio');
      setIsLoading(false);
      console.error('Audio error:', e);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(err => {
        setError('Failed to play audio: ' + err.message);
        console.error('Play error:', err);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e) => {
    if (!progressRef.current || duration === 0) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  return (
    <div className={styles.audioContainer}>
      <audio 
        ref={audioRef} 
        src={src} 
        className={className}
        preload="metadata"
        style={{ display: 'none' }}
      />
      
      {isLoading ? (
        <div className={styles.audioControls}>
          <Spinner size="tiny" label="Loading audio..." />
        </div>
      ) : error ? (
        <div className={styles.audioError}>
          <InfoRegular />
          <span>{error}</span>
        </div>
      ) : (
        <>
          <Button
            icon={isPlaying ? <PauseRegular /> : <PlayRegular />}
            appearance="subtle"
            onClick={togglePlayPause}
          />
          
          <div className={styles.audioProgress} ref={progressRef} onClick={handleProgressClick}>
            <div 
              className={styles.audioProgressFill} 
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
          
          <span className={styles.audioTime}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </>
      )}
    </div>
  );
};

export const ChatMessages = ({ messages, error, isLoading }) => {
  const styles = useStyles();
  const messagesEndRef = useRef(null);
  const { handleRetry } = useChat();
  const [retryingIds, setRetryingIds] = useState(new Set());

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
              {formatNumber(message.tokenUsage.totalTokens)} tokens
            </Text>
          </div>
        </Tooltip>
      </div>
    );
  };

  return (
    <div className={styles.chatContainer}>
      {messages.map((message, index) => {
        const isError = message.hasError && !retryingIds.has(message.id);
        const isUser = message.sender === 'user';

        // For messages with errors, we'll use a different container structure
        if (isError) {
          return (
            <div 
              key={index}
              className={`
                ${styles.messageWithErrorContainer} 
                ${!isUser ? styles.messageWithErrorContainerAi : ''}
              `}
            >
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
          );
        }
        
        // For regular messages without errors, use the standard layout
        return (
          <div
            key={index}
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
              </div>
            )}
            <div className={`${styles.timestampTooltip} ${isUser ? styles.timestampTooltipUser : styles.timestampTooltipAi} timestampTooltip`}>
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        );
      })}
      
      {error && <Text className={styles.error}>{error}</Text>}
      
      {/* Add a blank div for scrolling to the bottom */}
      <div ref={messagesEndRef} />
    </div>
  );
};