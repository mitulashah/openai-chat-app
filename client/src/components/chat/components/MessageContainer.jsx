import React from 'react';
import { makeStyles, shorthands, tokens } from '@fluentui/react-components';

const useStyles = makeStyles({
  messageRow: {
    display: 'flex',
    width: '100%',
    padding: '4px 0',
    position: 'relative',
    '&[data-sender="user"]': {
      justifyContent: 'flex-end',
    },
    '&[data-sender="ai"]': {
      justifyContent: 'flex-start',
    },
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
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
    border: '1px solid transparent',
    overflowWrap: 'break-word',
    wordBreak: 'break-word',
    overflow: 'hidden', // Prevent overflow in any direction
  },
  userMessage: {
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
    borderImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.05)) 1',
  },
  aiMessage: {
    backgroundColor: tokens.colorNeutralBackground3,
    borderImage: 'linear-gradient(to right, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.03)) 1',
  },
  summaryMessage: {
    backgroundColor: '#2d3250',
    color: '#f8f8f2',
    position: 'relative',
    marginTop: '16px',
    border: 'none',
    '&::before': {
      content: '"CONVERSATION SUMMARY"',
      position: 'absolute',
      top: '-20px',
      left: '-1px',
      fontSize: '12px',
      fontWeight: '700',
      color: '#FFB86C',
      backgroundColor: '#2d3250',
      padding: '5px 8px',
      lineHeight: '16px',
      borderRadius: '4px 4px 0 0',
      borderTop: 'none',
      borderLeft: 'none',
      borderRight: 'none',
    },
  },
  messageContainerWithHover: {
    '&:hover .timestampTooltip, &:hover .senderLabel': {
      opacity: 1,
    },
    marginBottom: '8px',
    marginTop: '4px',
    '.summaryMessage & .timestampTooltip': {
      bottom: '-25px',
    },
  },
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
});

export const MessageContainer = ({ 
  isUser,
  isSummary,
  isLastMessage,
  children 
}) => {
  const styles = useStyles();
  
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