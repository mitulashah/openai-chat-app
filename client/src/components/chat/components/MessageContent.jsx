import React from 'react';
import { makeStyles, shorthands } from '@fluentui/react-components';
import AudioPlayer from '../../audio/AudioPlayer';
import { MarkdownContent } from './MarkdownContent';
import { MessageTokenInfo } from './MessageTokenInfo';

const useStyles = makeStyles({
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
});

export const MessageContent = ({ 
  message, 
  isUser 
}) => {
  const styles = useStyles();
  
  return (
    <div className={styles.messageContent}>
      {message.text && <MarkdownContent text={message.text} />}
      
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
      
      {/* Show token usage info if available */}
      {!isUser && message.tokenUsage && (
        <MessageTokenInfo 
          tokenUsage={message.tokenUsage} 
          isUser={isUser}
        />
      )}
      
      {isUser && message.promptTokens && (
        <MessageTokenInfo 
          promptTokens={message.promptTokens} 
          isUser={isUser}
        />
      )}
    </div>
  );
};