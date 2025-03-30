import React from 'react';
import { 
  makeStyles, 
  shorthands, 
  Text, 
  Button,
} from '@fluentui/react-components';
import { ArrowResetRegular, ErrorCircleRegular } from '@fluentui/react-icons';
import { getErrorMessage } from '../../../utils/Utils';

const useStyles = makeStyles({
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
    color: '#FF5555',
    backgroundColor: 'transparent',
    padding: '4px 8px',
    fontSize: '12px',
    maxWidth: '300px',
  },
  errorIndicatorLeftAi: {
    justifyContent: 'flex-start',
  },
  errorMessage: {
    flex: 1,
    fontSize: '12px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});

export const MessageError = ({ 
  message, 
  isUser, 
  onRetry, 
  children 
}) => {
  const styles = useStyles();
  
  return (
    <div className={styles.messageWithErrorContainer + ' ' + 
      (!isUser ? styles.messageWithErrorContainerAi : '')}>
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
      {children}
    </div>
  );
};