import React, { useRef } from 'react';
import {
  makeStyles,
  shorthands,
  tokens,
} from '@fluentui/react-components';
import { useChat } from '../../contexts/ChatContext';
import { ErrorDisplay } from '../ErrorDisplay';
import { ChatActionBar } from './ChatActionBar';
import ChatMessage from './ChatMessage';
import EmptyMessage from './EmptyMessage';
import ChatSkeleton from './ChatSkeleton';
import { useScrollToBottom } from '../../hooks/useScrollToBottom';
import { useMessageStateTracking } from '../../hooks/useMessageStateTracking';

const useStyles = makeStyles({
  // Add wrapper for container to hold both messages and action bar
  chatWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  chatContainer: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    overflow: 'auto',
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
  }
});

export const ChatMessages = ({ messages, error, isLoading, isInitializing }) => {
  const styles = useStyles();
  const { handleRetry, setError, handleClearChat, handleSummarizeChat, isConfigured } = useChat();
  
  // Use our message state tracking hook
  const { retryingIds, handleRetryMessage } = useMessageStateTracking({ messages });

  // Use our custom scroll hook to handle all scroll-related logic
  const {
    messagesEndRef,
    messagesContainerRef,
    isWaitingForAIResponse,
    scrollToBottom,
    autoScrollEnabled
  } = useScrollToBottom({ messages });

  // Helper function that uses our extracted retry logic
  const onRetryMessage = (e, failedMessageId, originalInput, originalImage, originalVoice) => {
    handleRetryMessage(e, failedMessageId, originalInput, originalImage, originalVoice, handleRetry);
  };

  return (
    <div className={styles.chatWrapper}>
      <div 
        className={styles.chatContainer}
        ref={messagesContainerRef}
      >
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
      
      {/* Pass the already destructured values to ChatActionBar */}
      <ChatActionBar 
        onClearChat={handleClearChat} 
        onSummarizeChat={handleSummarizeChat}
        isConfigured={isConfigured} 
      />
    </div>
  );
};