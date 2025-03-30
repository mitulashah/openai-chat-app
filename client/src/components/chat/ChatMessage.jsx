import React from 'react';
import { makeStyles } from '@fluentui/react-components';
import { MessageContainer } from './components/MessageContainer';
import { MessageContent } from './components/MessageContent';
import { LoadingMessage } from './components/LoadingMessage';
import { RetryingMessage } from './components/RetryingMessage';
import { MessageError } from './components/MessageError';
import { MessageTimestamp } from './components/MessageTimestamp';

const useStyles = makeStyles({
  // Any remaining styles specific to the main component
});

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
  
  // For messages with errors, use the error component
  if (isError) {
    return (
      <div className="message-row">
        <MessageError message={message} isUser={isUser} onRetry={onRetry}>
          <MessageContainer isUser={isUser} isLastMessage={isLastMessage} isSummary={message.isSummary}>
            <MessageContent message={message} isUser={isUser} />
            <MessageTimestamp timestamp={message.timestamp} />
          </MessageContainer>
        </MessageError>
      </div>
    );
  }
  
  // For regular messages, use the standard container
  return (
    <MessageContainer 
      isUser={isUser} 
      isLastMessage={isLastMessage} 
      isSummary={message.isSummary}
    >
      {message.isLoading ? (
        <LoadingMessage />
      ) : isRetrying ? (
        <RetryingMessage message={message} isUser={isUser} />
      ) : (
        <MessageContent message={message} isUser={isUser} />
      )}
      <MessageTimestamp timestamp={message.timestamp} />
    </MessageContainer>
  );
};

export default ChatMessage;