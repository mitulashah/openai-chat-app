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
  },
  userMessage: {
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
  },
  aiMessage: {
    backgroundColor: tokens.colorNeutralBackground3,
  },
  summaryMessage: {
    backgroundColor: '#6272A4',
    color: '#282A36',
    position: 'relative',
    marginTop: '16px',
    border: '1px solid #6272A4',
    borderTop: 'none',
    '&::before': {
      content: '"CONVERSATION SUMMARY"',
      position: 'absolute',
      top: '-20px',
      left: '-1px',
      fontSize: '12px',
      fontWeight: '700',
      color: '#282A36',
      backgroundColor: '#6272A4',
      padding: '5px 8px',
      lineHeight: '16px',
      borderRadius: '4px 4px 0 0',
      borderTop: '1px solid #6272A4',
      borderLeft: '1px solid #6272A4',
      borderRight: '1px solid #6272A4',
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