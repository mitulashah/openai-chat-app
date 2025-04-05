import React from 'react';
import { useMessageStyles } from '../../../styles/components/chat/messageStyles';

export const MessageContainer = ({ 
  isUser,
  isSummary,
  isLastMessage,
  children 
}) => {
  const styles = useMessageStyles();
  
  return (
    <div 
      className={styles.messageRow}
      data-is-last-message={isLastMessage ? 'true' : 'false'}
      data-sender={isUser ? 'user' : 'ai'}
    >
      <div
        className={`
          ${styles.messageContainer} 
          ${isUser ? styles.userMessage : isSummary ? styles.summaryMessage : styles.aiMessage}
          ${styles.messageContainerWithHover}
        `}
      >
        {/* Sender label that appears on hover */}
        <div className={`
          ${styles.senderLabel} 
          ${isUser ? styles.senderLabelUser : styles.senderLabelAi}
          senderLabel
        `}>
          {isUser ? 'YOU' : 'AI'}
        </div>
        {children}
      </div>
    </div>
  );
};