import React from 'react';
import { makeStyles, shorthands, Text, Spinner } from '@fluentui/react-components';
import { MarkdownContent } from './MarkdownContent';
import AudioPlayer from '../../audio/AudioPlayer';

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
  retryingIndicator: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('4px'),
    opacity: 0.7,
  },
});

export const RetryingMessage = ({ message, isUser }) => {
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
      
      <div className={styles.retryingIndicator}>
        <Spinner size="tiny" />
        <Text>Retrying message...</Text>
      </div>
    </div>
  );
};