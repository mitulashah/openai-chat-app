import React from 'react';
import {
  Text,
  makeStyles,
  shorthands,
  tokens,
  Spinner,
  Button,
  Tooltip,
} from '@fluentui/react-components';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  ErrorCircleRegular,
  ArrowResetRegular,
  DataUsageRegular
} from '@fluentui/react-icons';
import AudioPlayer from '../audio/AudioPlayer';
import { formatNumber, formatTimestamp, getErrorMessage } from '../../utils/Utils';

// Style definitions for the ChatMessage component
const useStyles = makeStyles({
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
  summaryMessage: {
    backgroundColor: '#6272A4', // Dracula comment color without transparency
    color: '#282A36', // Match text color to the tab's text color
    position: 'relative',
    marginTop: '16px', // Changed from 20px to 16px to match regular message spacing
    border: '1px solid #6272A4', // Add border to match the tab
    borderTop: 'none', // Remove top border since the tab has it
    '&::before': {
      content: '"CONVERSATION SUMMARY"',
      position: 'absolute',
      top: '-20px',
      left: '-1px', // Fully align with the bubble by accounting for border
      fontSize: '12px',
      fontWeight: '700', // Increased from 600 to 700 for bolder text
      color: '#282A36', // Dracula background color (darker)
      backgroundColor: '#6272A4', // Same as the bubble background without transparency
      padding: '5px 8px', // Increased vertical padding from 3px to 5px
      lineHeight: '16px', // Added line-height property
      borderRadius: '4px 4px 0 0',
      borderTop: '1px solid #6272A4', // Dracula comment color
      borderLeft: '1px solid #6272A4',
      borderRight: '1px solid #6272A4',
    },
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
    bottom: '-23px', // Moved up 1px from -24px
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
    opacity: 0,
    transition: 'opacity 0.2s ease',
    pointerEvents: 'none',
    backgroundColor: 'transparent',
    padding: '2px 6px',
    borderRadius: '4px',
    zIndex: 10,
    whiteSpace: 'nowrap',
    boxShadow: 'none',
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
    backgroundColor: 'transparent',
    padding: '2px 6px',
    borderRadius: '4px',
    zIndex: 10,
    whiteSpace: 'nowrap',
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
    '.summaryMessage & .timestampTooltip': {
      bottom: '-25px', // Specific adjustment for timestamp tooltip in summary messages
    },
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
});

/**
 * Renders token usage information for an AI message
 * @param {Object} message - Message object containing token usage data
 * @param {Object} styles - Styles object from useStyles
 * @returns {JSX.Element|null} Token usage UI or null if no token data
 */
const TokenUsage = ({ tokenUsage, styles }) => {
  if (!tokenUsage) return null;
  
  return (
    <div className={styles.tokenInfo}>
      <Tooltip
        content={
          <div className={styles.tokenTooltipContent}>
            <div className={styles.tokenStatsRow}>
              <Text>Prompt Tokens:</Text>
              <Text weight="semibold">{formatNumber(tokenUsage.promptTokens)}</Text>
            </div>
            <div className={styles.tokenStatsRow}>
              <Text>Completion Tokens:</Text>
              <Text weight="semibold">{formatNumber(tokenUsage.completionTokens)}</Text>
            </div>
            <div className={styles.tokenStatsRow}>
              <Text>Total Tokens:</Text>
              <Text weight="semibold">{formatNumber(tokenUsage.totalTokens)}</Text>
            </div>
          </div>
        }
        relationship="label"
        positioning="above"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <DataUsageRegular className={styles.tokenIcon} />
          <Text className={styles.tokenText}>
            {formatNumber(tokenUsage.completionTokens)} tokens
          </Text>
        </div>
      </Tooltip>
    </div>
  );
};

/**
 * Renders prompt token information for a user message
 * @param {number} promptTokens - Number of tokens in the prompt
 * @param {Object} styles - Styles object from useStyles
 * @returns {JSX.Element|null} Prompt tokens UI or null if no token data
 */
const PromptTokens = ({ promptTokens, styles }) => {
  if (!promptTokens) return null;
  
  return (
    <div className={styles.tokenInfo}>
      <Tooltip
        content={
          <div className={styles.tokenTooltipContent}>
            <div className={styles.tokenStatsRow}>
              <Text>Prompt Tokens:</Text>
              <Text weight="semibold">{formatNumber(promptTokens)}</Text>
            </div>
          </div>
        }
        relationship="label"
        positioning="above"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <DataUsageRegular className={styles.tokenIconUser} />
          <Text className={styles.tokenTextUser}>
            {formatNumber(promptTokens)} tokens
          </Text>
        </div>
      </Tooltip>
    </div>
  );
};

/**
 * Common markdown rendering configuration
 */
const markdownComponents = {
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
};

/**
 * Message component to represent a single message in the chat
 * 
 * @param {Object} props - Component props
 * @param {Object} props.message - Message data
 * @param {boolean} props.isRetrying - Whether the message is being retried
 * @param {Function} props.onRetry - Callback for retrying failed messages
 * @param {boolean} props.isLastMessage - Whether this is the last message in the chat
 * @returns {JSX.Element} Rendered message component
 */
export const ChatMessage = ({
  message,
  isRetrying,
  onRetry,
  isLastMessage
}) => {
  const styles = useStyles();
  const isError = message.hasError && !isRetrying;
  const isUser = message.sender === 'user';
  
  // Format timestamp for tooltip
  const formattedTime = formatTimestamp(message.timestamp);
  
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
                    components={markdownComponents}
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
          ${isUser ? styles.userMessage : message.isSummary ? styles.summaryMessage : styles.aiMessage}
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
                  components={markdownComponents}
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
                  components={markdownComponents}
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
            {!isUser && message.tokenUsage && <TokenUsage tokenUsage={message.tokenUsage} styles={styles} />}
            {isUser && message.promptTokens && <PromptTokens promptTokens={message.promptTokens} styles={styles} />}
          </div>
        )}
        <div className={`${styles.timestampTooltip} timestampTooltip`}>
          {formattedTime}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;